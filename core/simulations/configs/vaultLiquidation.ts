import {
    warpTime,
    resetNetworkAndSetupWallet,
    setCollateralInVat,
    addDaiToBalance,
    addMkrToBalance,
} from '../../helpers/hardhat';
import { Simulation } from '../types';
import prompts from 'prompts';
import COLLATERALS, { getCollateralConfigByType } from '../../src/constants/COLLATERALS';
import BigNumber from '../../src/bignumber';
import {
    changeVaultContents,
    collectStabilityFees,
    fetchVault,
    openVault,
    liquidateVault,
    fetchVaultCollateralParameters,
} from '../../src/vaults';
import { HARDHAT_PUBLIC_KEY, TEST_NETWORK } from '../../helpers/constants';
import getContract, {
    getContractAddressByName,
    getErc20Contract,
    getJoinNameByCollateralType,
} from '../../src/contracts';
import { depositCollateralToVat, fetchCollateralInVat, withdrawCollateralFromVat } from '../../src/wallet';
import { MAX, RAD_NUMBER_OF_DIGITS } from '../../src/constants/UNITS';
import { CollateralType } from '../../src/types';
import { ethers } from 'ethers';
import { randomBigNumber } from '../../helpers/hex';

const getCollateralType = async () => {
    const { collateralType } = await prompts([
        {
            type: 'select',
            name: 'collateralType',
            message: 'Select the collateral symbol to add to the VAT.',
            choices: Object.keys(COLLATERALS)
                .sort()
                .map(collateral => ({
                    title: collateral,
                    value: collateral,
                })),
        },
    ]);
    return collateralType;
};

const getLatestVault = async () => {
    const cdpManager = await getContract(TEST_NETWORK, 'CDP_MANAGER', true);
    const lastHex = await cdpManager.last(HARDHAT_PUBLIC_KEY);
    return new BigNumber(lastHex._hex).toNumber();
};

const getVaultLimits = async (collateralType: CollateralType) => {
    const contract = await getContract(TEST_NETWORK, 'MCD_VAT');
    const typeHex = ethers.utils.formatBytes32String(collateralType);
    const { dust, line } = await contract.ilks(typeHex);
    const { minUnitPrice } = await fetchVaultCollateralParameters(TEST_NETWORK, collateralType);
    return {
        minCollateralInVault: new BigNumber(dust._hex).shiftedBy(-RAD_NUMBER_OF_DIGITS).div(minUnitPrice),
        maxCollateralInVault: new BigNumber(line._hex).shiftedBy(-RAD_NUMBER_OF_DIGITS).div(minUnitPrice),
    };
};

const getBaseContext = async () => {
    const collateralType = await getCollateralType();
    const vaultLimits = await getVaultLimits(collateralType);
    const decimals = COLLATERALS[collateralType].decimals;
    const collateralOwned = new BigNumber(
        randomBigNumber(
            vaultLimits.minCollateralInVault,
            BigNumber.min(
                vaultLimits.maxCollateralInVault.dividedBy(1.2),
                vaultLimits.minCollateralInVault.multipliedBy(1.2)
            )
        ).toFixed(0)
    );
    console.info(`Collateral in the VAT initially: ${collateralOwned.toFixed()}`);
    return {
        collateralType,
        decimals,
        collateralOwned,
        ...vaultLimits,
    };
};

const simulation: Simulation = {
    title: 'Simulate liquidation Auctions',
    steps: [
        {
            title: 'Reset blockchain fork',
            // Few blocks before WSTETH-A is taken at 14052147,
            // https://etherscan.io/address/0x49a33a28c4c7d9576ab28898f4c9ac7e52ea457at
            entry: async () => {
                await resetNetworkAndSetupWallet(14052140);
                return getBaseContext();
            },
        },
        {
            title: 'Create the auction',
            entry: async context => {
                console.info('Setting collateral in VAT...');
                const collateralType = context.collateralType;
                await setCollateralInVat(collateralType, context.collateralOwned);
                let balance = await fetchCollateralInVat(
                    TEST_NETWORK,
                    HARDHAT_PUBLIC_KEY,
                    collateralType,
                    context.decimals
                );
                if (!balance.eq(context.collateralOwned)) {
                    throw new Error(
                        `Unexpected vat balance. Expected: ${context.collateralOwned.toFixed()}, Actual: ${balance.toFixed()}`
                    );
                }
                console.info(
                    `Vat Collateral ${collateralType} balance of ${HARDHAT_PUBLIC_KEY} is ${context.collateralOwned.toFixed()}`
                );
                console.info('Opening the vault');
                await openVault(TEST_NETWORK, HARDHAT_PUBLIC_KEY, context.collateralType);
                console.info('Extracting collateral');
                const addressJoin = await getContractAddressByName(
                    TEST_NETWORK,
                    getJoinNameByCollateralType(context.collateralType)
                );
                const collateralConfig = getCollateralConfigByType(context.collateralType);
                const tokenContractAddress = await getContractAddressByName(TEST_NETWORK, collateralConfig.symbol);
                const contract = await getErc20Contract(TEST_NETWORK, tokenContractAddress, true);
                await contract.approve(addressJoin, MAX.toFixed(0));
                console.info('Max allowance given out');
                await withdrawCollateralFromVat(TEST_NETWORK, HARDHAT_PUBLIC_KEY, context.collateralType, undefined);
                const token = await getErc20Contract(TEST_NETWORK, tokenContractAddress);
                const balanceHex = await token.balanceOf(HARDHAT_PUBLIC_KEY);
                balance = new BigNumber(balanceHex._hex).shiftedBy(-context.decimals);
                if (!balance.eq(context.collateralOwned)) {
                    throw new Error(
                        `Unexpected wallet balance. Expected ${context.collateralOwned.toFixed()}, Actual ${balance.toFixed()}`
                    );
                }
                console.info(
                    `Wallet ${HARDHAT_PUBLIC_KEY} has ${context.collateralOwned.toFixed()} of token ${tokenContractAddress}`
                );
                console.info('Depositing Collateral to vault');
                const latestVaultId = await getLatestVault();
                let vault = await fetchVault(TEST_NETWORK, latestVaultId);
                await depositCollateralToVat(
                    TEST_NETWORK,
                    vault.address,
                    vault.collateralType,
                    context.collateralOwned
                );
                console.info('Adding collateral to Vault');
                vault = await fetchVault(TEST_NETWORK, latestVaultId);
                const drawnDebtExact = context.collateralOwned
                    .multipliedBy(vault.minUnitPrice)
                    .dividedBy(vault.stabilityFeeRate);
                const drawnDebt = new BigNumber(
                    drawnDebtExact.toPrecision(drawnDebtExact.e || 0 + 1, BigNumber.ROUND_DOWN)
                );
                console.info(drawnDebt.toFixed(), vault.minUnitPrice.toFixed(), drawnDebtExact.toFixed());
                await changeVaultContents(TEST_NETWORK, latestVaultId, drawnDebt, context.collateralOwned);
                const vaultWithContents = await fetchVault(TEST_NETWORK, latestVaultId);
                console.info(
                    `Vault's contents: ${vaultWithContents.collateralAmount.toFixed()} of collateral, ${
                        vaultWithContents.initialDebtDai
                    } of debt`
                );
                return { ...context, latestVaultId };
            },
        },
        {
            title: 'Skip time',
            entry: async context => {
                await warpTime();
                return context;
            },
        },
        {
            title: 'Collect stability fees',
            entry: async context => {
                const collateralType = context.collateralType;
                const latestVaultId = context.latestVaultId;
                const vaultBefore = await fetchVault(TEST_NETWORK, latestVaultId);
                console.info(`stability fees after ${vaultBefore.stabilityFeeRate}`);
                await collectStabilityFees(TEST_NETWORK, collateralType);
                const vaultAfter = await fetchVault(TEST_NETWORK, latestVaultId);
                console.info(`stability fees after ${vaultAfter.stabilityFeeRate}`);
                return context;
            },
        },
        {
            title: 'Open the auction',
            entry: async context => {
                const liquidatedId = context.latestVaultId;
                const vault = await fetchVault(TEST_NETWORK, liquidatedId);
                await liquidateVault(TEST_NETWORK, vault.collateralType, vault.address);
            },
        },
        {
            title: 'Add DAI and MKR to the wallet',
            entry: async () => {
                await addDaiToBalance(new BigNumber(100000), HARDHAT_PUBLIC_KEY);
                await addMkrToBalance(new BigNumber(100000), HARDHAT_PUBLIC_KEY);
            },
        },
    ],
};

export default simulation;

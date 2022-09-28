import { warpTime, resetNetworkAndSetupWallet, addDaiToBalance, addMkrToBalance } from '../../helpers/hardhat';
import { Simulation } from '../types';
import prompts from 'prompts';
import COLLATERALS from '../../src/constants/COLLATERALS';
import BigNumber from '../../src/bignumber';
import { collectStabilityFees, fetchVault, liquidateVault, fetchVaultCollateralParameters } from '../../src/vaults';
import { HARDHAT_PUBLIC_KEY, TEST_NETWORK } from '../../helpers/constants';
import getContract from '../../src/contracts';
import { RAD_NUMBER_OF_DIGITS } from '../../src/constants/UNITS';
import { CollateralType } from '../../src/types';
import { ethers } from 'ethers';
import { randomBigNumber } from '../../helpers/hex';
import createVaultForCollateral from '../steps/createVaultForCollateral';

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
                const latestVaultId = await createVaultForCollateral(
                    context.collateralType,
                    context.collateralOwned,
                    context.decimals
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

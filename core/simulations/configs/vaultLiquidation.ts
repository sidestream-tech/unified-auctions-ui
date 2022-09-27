import { warpTime, resetNetworkAndSetupWallet, setCollateralInVat } from '../../helpers/hardhat';
import { Simulation } from '../types';
import prompts from 'prompts';
import COLLATERALS, { getCollateralConfigByType } from '../../src/constants/COLLATERALS';
import BigNumber from 'bignumber.js';
import memoizee from 'memoizee';
import {
    changeVaultContents,
    collectStabilityFees,
    fetchVault,
    openVault,
    liquidateVault,
    fetchVaultBase,
} from '../../src/vaults';
import { HARDHAT_PUBLIC_KEY, TEST_NETWORK } from '../../helpers/constants';
import getContract, {
    getContractAddressByName,
    getErc20Contract,
    getJoinNameByCollateralType,
} from '../../src/contracts';
import { depositCollateralToVat, withdrawCollateralFromVat } from '../../src/wallet';
import { MAX } from '../../src/constants/UNITS';
import { assertBalance, assertVatCollateralBalance } from '../../helpers/assertions';

const COLLATARAL_OWNED_WAD = new BigNumber(20000);

const _getCollateralType = async () => {
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

const getCollateralType = memoizee(_getCollateralType, {
    promise: true,
});

const _getLatestVault = async () => {
    const cdpManager = await getContract(TEST_NETWORK, 'CDP_MANAGER', true);
    const lastHex = await cdpManager.last(HARDHAT_PUBLIC_KEY);
    return new BigNumber(lastHex._hex).toNumber();
};

const getLatestVaultIndex = memoizee(_getLatestVault, { promise: true });

const simulation: Simulation = {
    title: 'Simulate liquidation Auctions',
    steps: [
        {
            title: 'Reset blockchain fork',
            // Few blocks before WSTETH-A is taken at 14052147,
            // https://etherscan.io/address/0x49a33a28c4c7d9576ab28898f4c9ac7e52ea457at
            entry: async () => {
                await resetNetworkAndSetupWallet(14052140);
                getLatestVaultIndex.clear();
                getCollateralType.clear();
            },
        },
        {
            title: 'Set collateral in VAT',
            entry: async () => {
                const collateralType = await getCollateralType();
                await setCollateralInVat(collateralType, COLLATARAL_OWNED_WAD);
                await assertVatCollateralBalance(
                    TEST_NETWORK,
                    HARDHAT_PUBLIC_KEY,
                    collateralType,
                    COLLATARAL_OWNED_WAD
                );
            },
        },
        {
            title: 'Open the vault',
            entry: async () => {
                const collateralType = await getCollateralType();
                await openVault(TEST_NETWORK, HARDHAT_PUBLIC_KEY, collateralType);
            },
        },
        {
            title: 'Extract collateral',
            entry: async () => {
                const collateralType = await getCollateralType();
                const addressJoin = await getContractAddressByName(
                    TEST_NETWORK,
                    getJoinNameByCollateralType(collateralType)
                );
                const collateralConfig = getCollateralConfigByType(collateralType);
                const tokenContractAddress = await getContractAddressByName(TEST_NETWORK, collateralConfig.symbol);
                const contract = await getErc20Contract(TEST_NETWORK, tokenContractAddress, true);
                await contract.approve(addressJoin, MAX.toFixed(0));
                await withdrawCollateralFromVat(TEST_NETWORK, HARDHAT_PUBLIC_KEY, collateralType, undefined);
                await assertBalance(TEST_NETWORK, tokenContractAddress, HARDHAT_PUBLIC_KEY, COLLATARAL_OWNED_WAD);
            },
        },
        {
            title: 'Deposit Collateral to vault',
            entry: async () => {
                const latestVaultId = await getLatestVaultIndex();
                const vault = await fetchVaultBase(TEST_NETWORK, latestVaultId);
                await depositCollateralToVat(TEST_NETWORK, vault.address, vault.collateralType, COLLATARAL_OWNED_WAD);
                await assertVatCollateralBalance(
                    TEST_NETWORK,
                    vault.address,
                    vault.collateralType,
                    COLLATARAL_OWNED_WAD
                );
            },
        },
        {
            title: 'Add collateral to Vault',
            entry: async () => {
                const latestVaultId = await getLatestVaultIndex();
                const vault = await fetchVault(TEST_NETWORK, latestVaultId);
                const drawnDebtExact = COLLATARAL_OWNED_WAD.multipliedBy(vault.minUnitPrice).dividedBy(
                    vault.stabilityFeeRate
                );
                const drawnDebt = new BigNumber(
                    drawnDebtExact.toPrecision(drawnDebtExact.e || 0 + 1, BigNumber.ROUND_DOWN)
                );
                console.info(drawnDebt.toFixed(), vault.minUnitPrice.toFixed(), drawnDebtExact.toFixed());
                await changeVaultContents(TEST_NETWORK, latestVaultId, drawnDebt, COLLATARAL_OWNED_WAD);
                const vaultWithContents = await fetchVault(TEST_NETWORK, latestVaultId);
                console.info(
                    `Vault's contents: ${vaultWithContents.collateralAmount.toFixed()} of collateral, ${
                        vaultWithContents.initialDebtDai
                    } of debt`
                );
            },
        },
        {
            title: 'Skip time',
            entry: async () => await warpTime(),
        },
        {
            title: 'Collect stability fees',
            entry: async () => {
                const collateralType = await getCollateralType();
                const latestVaultId = await getLatestVaultIndex();
                const vaultBefore = await fetchVault(TEST_NETWORK, latestVaultId);
                console.info(`stability fees after ${vaultBefore.stabilityFeeRate}`);
                await collectStabilityFees(TEST_NETWORK, collateralType);
                const vaultAfter = await fetchVault(TEST_NETWORK, latestVaultId);
                console.info(`stability fees after ${vaultAfter.stabilityFeeRate}`);
            },
        },
        {
            title: 'Bark',
            entry: async () => {
                const liquidatedId = await getLatestVaultIndex();
                const vault = await fetchVault(TEST_NETWORK, liquidatedId);
                await liquidateVault(TEST_NETWORK, vault.collateralType, vault.address);
            },
        },
    ],
};

export default simulation;

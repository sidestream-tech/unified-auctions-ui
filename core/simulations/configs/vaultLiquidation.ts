import { warpTime, resetNetworkAndSetupWallet, addDaiToBalance, addMkrToBalance } from '../../helpers/hardhat';
import { Simulation } from '../types';
import prompts from 'prompts';
import COLLATERALS from '../../src/constants/COLLATERALS';
import BigNumber from '../../src/bignumber';
import { collectStabilityFees, fetchVault, liquidateVault } from '../../src/vaults';
import { HARDHAT_PUBLIC_KEY, TEST_NETWORK } from '../../helpers/constants';
import createVaultForCollateral, { getCollateralAmountInVat } from '../steps/createVaultForCollateral';

const UNSUPPORTED_COLLATERAL_TYPES = ['CRVV1ETHSTETH-A'];

export const getLiquidatableCollateralTypes = () => {
    return Object.keys(COLLATERALS).filter(collateralType => !UNSUPPORTED_COLLATERAL_TYPES.includes(collateralType));
};

const getCollateralType = async () => {
    const { collateralType } = await prompts([
        {
            type: 'select',
            name: 'collateralType',
            message: 'Select the collateral symbol to add to the VAT.',
            choices: Object.keys(getLiquidatableCollateralTypes())
                .sort()
                .map(collateral => ({
                    title: collateral,
                    value: collateral,
                })),
        },
    ]);
    return collateralType;
};

const getBaseContext = async () => {
    const collateralType = await getCollateralType();
    const vaultLimits = await getCollateralAmountInVat(collateralType);
    const decimals = COLLATERALS[collateralType].decimals;
    const collateralOwned = await getCollateralAmountInVat(collateralType);

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
            title: 'Create the vault',
            entry: async context => {
                const latestVaultId = await createVaultForCollateral(context.collateralType, context.collateralOwned);
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
                console.info(`stability fees before ${vaultBefore.stabilityFeeRate}`);
                await collectStabilityFees(TEST_NETWORK, collateralType);
                const vaultAfter = await fetchVault(TEST_NETWORK, latestVaultId);
                console.info(`stability fees after ${vaultAfter.stabilityFeeRate}`);
                return context;
            },
        },
        {
            title: 'Liquidate the vault',
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

import {
    warpTime,
    resetNetworkAndSetupWallet,
    addDaiToBalance,
    addMkrToBalance,
    resetNetwork,
} from '../../helpers/hardhat';
import { Simulation } from '../types';
import prompts from 'prompts';
import COLLATERALS from '../../src/constants/COLLATERALS';
import { collectStabilityFees, fetchVault, liquidateVault } from '../../src/vaults';
import { TEST_NETWORK } from '../../helpers/constants';
import createVaultWithCollateral, {
    calculateMinCollateralAmountToOpenVault,
    determineBalanceSlot,
} from '../helpers/createVaultWithCollateral';

const UNSUPPORTED_COLLATERAL_TYPES = [
    'CRVV1ETHSTETH-A', // collateral handled differently
    'UNIV2DAIUSDC-A', // Liquidation limit too high (fails with "Dog/liquidation-limit-hit")
    'WSTETH-B', // does not accumulate stability fee rate at all.
];

export const getLiquidatableCollateralTypes = () => {
    return Object.keys(COLLATERALS).filter(collateralType => !UNSUPPORTED_COLLATERAL_TYPES.includes(collateralType));
};

const getCollateralType = async () => {
    const { collateralType } = await prompts([
        {
            type: 'select',
            name: 'collateralType',
            message: 'Select the collateral symbol to add to the VAT.',
            choices: getLiquidatableCollateralTypes()
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
    const decimals = COLLATERALS[collateralType].decimals;
    const collateralOwned = await calculateMinCollateralAmountToOpenVault(collateralType);

    console.info(`Collateral in the VAT initially: ${collateralOwned.toFixed()}`);
    return {
        collateralType,
        decimals,
        collateralOwned,
    };
};

const simulation: Simulation = {
    title: 'Simulate liquidation Auctions',
    steps: [
        {
            title: 'Reset blockchain fork',
            entry: async () => {
                await resetNetworkAndSetupWallet();
                return getBaseContext();
            },
        },
        {
            title: 'Create the vault',
            entry: async context => {
                const [balanceSlot, languageFormat] = await determineBalanceSlot(context.collateralType);
                resetNetwork();
                const latestVaultId = await createVaultWithCollateral(
                    context.collateralType,
                    context.collateralOwned,
                    balanceSlot,
                    languageFormat
                );
                return { ...context, latestVaultId };
            },
        },
        {
            title: 'Skip time',
            entry: async context => {
                await warpTime(60 * 24 * 30, 60);
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
            title: 'Skip time',
            entry: async context => {
                await warpTime(60, 60);
                return context;
            },
        },
        {
            title: 'Add DAI and MKR to the wallet',
            entry: async () => {
                await addDaiToBalance();
                await addMkrToBalance();
            },
        },
    ],
};

export default simulation;

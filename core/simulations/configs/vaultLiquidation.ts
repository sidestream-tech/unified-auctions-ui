import { warpTime, resetNetworkAndSetupWallet } from '../../helpers/hardhat/network';
import { addDaiToBalance, addMkrToBalance } from '../../helpers/hardhat/balance';
import { Simulation } from '../types';
import { collectStabilityFees, fetchVault, liquidateVault } from '../../src/vaults';
import { TEST_NETWORK } from '../../helpers/constants';
import createVaultWithCollateral, {
    calculateMinCollateralAmountToOpenVault,
    getLiquidatableCollateralTypes,
} from '../helpers/createVaultWithCollateral';
import promptToSelectOneOption from '../helpers/promptToSelectOneOption';
import { grantAdminPrivelegeForContract } from '../../helpers/hardhat/slotOverwrite';
import { setDebtCeilingToMax, setLiquidationLimitToMax } from '../../helpers/hardhat/contractParametrization';

const simulation: Simulation = {
    title: 'Simulate liquidation Auctions',
    steps: [
        {
            title: 'Reset blockchain fork',
            entry: async () => {
                await resetNetworkAndSetupWallet();
                const collateralType = await promptToSelectOneOption(
                    'Select the collateral symbol to add to the VAT.',
                    getLiquidatableCollateralTypes()
                );
                return {
                    collateralType,
                };
            },
        },
        {
            title: 'Create the vault',
            entry: async context => {
                console.info('Granting admin priveleges for MCD_VAT...');
                await grantAdminPrivelegeForContract('MCD_VAT');
                console.info('Granting admin priveleges for MCD_DOG...');
                await grantAdminPrivelegeForContract('MCD_DOG');
                await setLiquidationLimitToMax(context.collateralType);
                console.info('liquidation limit accumulation is overwritten');
                await setDebtCeilingToMax(context.collateralType);
                console.info('debt ceiling is overwritten');
                const collateralOwned = await calculateMinCollateralAmountToOpenVault(context.collateralType);
                console.info(`Minimum collateral amount to open vault: ${collateralOwned.toFixed()}`);
                const latestVaultId = await createVaultWithCollateral(context.collateralType, collateralOwned);
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

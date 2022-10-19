import { warpTime, resetNetworkAndSetupWallet } from '../../helpers/hardhat/network';
import { addDaiToBalance, addMkrToBalance } from '../../helpers/hardhat/balance';
import { Simulation } from '../types';
import prompts from 'prompts';
import COLLATERALS from '../../src/constants/COLLATERALS';
import { collectStabilityFees, fetchVault, liquidateVault } from '../../src/vaults';
import { TEST_NETWORK } from '../../helpers/constants';
import createVaultWithCollateral, {
    calculateMinCollateralAmountToOpenVault,
} from '../helpers/createVaultWithCollateral';

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

const simulation: Simulation = {
    title: 'Onboard new collateral',
    steps: [
        {
            title: 'Reset blockchain fork and add balances',
            entry: async () => {
                await resetNetworkAndSetupWallet();
                await addDaiToBalance();
                await addMkrToBalance();
            },
        },
        {
            title: 'Execute the spell',
            entry: async () => {
                console.info('Execute the spell');
            },
        },
        {
            title: 'Create new auction',
            entry: async () => {
                const collateralType = await getCollateralType();
                const collateralOwned = await calculateMinCollateralAmountToOpenVault(collateralType);
                const vaultId = await createVaultWithCollateral(collateralType, collateralOwned);
                await warpTime(60 * 24 * 30, 60);
                await collectStabilityFees(TEST_NETWORK, collateralType);
                const vault = await fetchVault(TEST_NETWORK, vaultId);
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
    ],
};

export default simulation;

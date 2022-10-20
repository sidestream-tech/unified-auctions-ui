import hre from 'hardhat';
import { warpTime, resetNetworkAndSetupWallet } from '../../helpers/hardhat/network';
import { addMkrToBalance } from '../../helpers/hardhat/balance';
import { Simulation } from '../types';
import prompts from 'prompts';
import COLLATERALS from '../../src/constants/COLLATERALS';
import { collectStabilityFees, fetchVault, liquidateVault } from '../../src/vaults';
import { TEST_NETWORK } from '../../helpers/constants';
import createVaultWithCollateral, {
    calculateMinCollateralAmountToOpenVault,
} from '../helpers/createVaultWithCollateral';
import executeSpell from '../helpers/executeSpell';
import { getContractAddressByName } from '../../src/contracts';

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
                await resetNetworkAndSetupWallet(15777270);
                await addMkrToBalance();
            },
        },
        // {
        //     title: 'Deploy the spell',
        //     entry: () => deploySpell('https://github.com/makerdao/spells-mainnet', 'CES-795'),
        // },
        {
            title: 'Execute the spell',
            entry: async () => {
                const printValueChangedByTheSpell = async function () {
                    // MCD_PSM_GUSD_A tout uint256
                    const address = await getContractAddressByName(TEST_NETWORK, 'MCD_PSM_GUSD_A');
                    const contract = await hre.ethers.getContractAt(
                        ['function tout() external view returns (uint256)'],
                        address
                    );
                    const value = await contract.tout();
                    console.info(`tout`, value);
                };
                await printValueChangedByTheSpell();
                await executeSpell('0x8E4faFef5bF61f09654aDeB46E6bC970BcD42c52');
                await printValueChangedByTheSpell();
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

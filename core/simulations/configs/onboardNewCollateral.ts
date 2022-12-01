import BigNumber from '../../src/bignumber';
import { warpTime, resetNetworkAndSetupWallet } from '../../helpers/hardhat/network';
import { addDaiToBalance } from '../../helpers/hardhat/balance';
import { Simulation } from '../types';
import { getAllCollateralTypes } from '../../src/constants/COLLATERALS';
import { collectStabilityFees, fetchVault, liquidateVault } from '../../src/vaults';
import { TEST_NETWORK } from '../../helpers/constants';
import createVaultWithCollateral, {
    calculateMinCollateralAmountToOpenVault,
} from '../helpers/createVaultWithCollateral';
import deploySpell, { getAllSpellNames } from '../helpers/deploySpell';
import executeSpell from '../helpers/executeSpell';
import { getOsmPrices } from '../../src/oracles';
import { overwriteCurrentOraclePrice } from '../../helpers/hardhat/overwrites';
import promptToSelectOneOption from '../helpers/promptToSelectOneOption';

const simulation: Simulation = {
    title: 'Onboard new collateral',
    steps: [
        {
            title: 'Reset blockchain fork and add balances',
            entry: async () => {
                await resetNetworkAndSetupWallet(15791971);
                await addDaiToBalance();
            },
        },
        {
            title: 'Deploy the spell',
            entry: async () => {
                const spellName = await promptToSelectOneOption(
                    'Select the spell you want to deploy',
                    getAllSpellNames()
                );
                const spellAddress = await deploySpell(TEST_NETWORK, spellName);
                return {
                    spellAddress,
                };
            },
        },
        {
            title: 'Execute the spell',
            entry: async context => {
                await executeSpell(context.spellAddress);
            },
        },
        {
            title: 'Create new auction',
            entry: async () => {
                const collateralType = await promptToSelectOneOption(
                    'Select the collateral symbol to add to the VAT',
                    getAllCollateralTypes()
                );
                // overwrite oracle price
                await overwriteCurrentOraclePrice(TEST_NETWORK, collateralType, new BigNumber(1000));
                const oraclePrices = await getOsmPrices(TEST_NETWORK, collateralType);
                console.info(`New ${collateralType} oracle price is ${oraclePrices.currentUnitPrice.toFixed()} DAI`);
                // create and liquidate vault
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

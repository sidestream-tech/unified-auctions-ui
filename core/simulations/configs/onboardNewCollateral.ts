import BigNumber from '../../src/bignumber';
import { warpTime } from '../../helpers/hardhat/network';
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
import { getCurrentOraclePriceByCollateralType } from '../../src/oracles';
import { overwriteCurrentOraclePrice } from '../../helpers/hardhat/overwrites';
import promptToSelectOneOption from '../helpers/promptToSelectOneOption';

const simulation: Simulation = {
    title: 'Onboard new collateral',
    steps: [
        {
            title: 'Choose spell to deploy',
            entry: async () => {
                const spellName = await promptToSelectOneOption(
                    'Select the spell you want to deploy',
                    getAllSpellNames()
                );
                const spellAddress = await deploySpell(TEST_NETWORK, spellName);
                await addDaiToBalance();
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
                const oraclePrice = await getCurrentOraclePriceByCollateralType(TEST_NETWORK, collateralType);
                console.info(`New ${collateralType} oracle price is ${oraclePrice.toFixed()} DAI`);
                // create and liquidate vault
                const collateralOwned = await calculateMinCollateralAmountToOpenVault(collateralType);
                const { vaultIndex } = await createVaultWithCollateral(collateralType, collateralOwned);
                await warpTime(60 * 24 * 30, 60);
                await collectStabilityFees(TEST_NETWORK, collateralType);
                const vault = await fetchVault(TEST_NETWORK, vaultIndex);
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

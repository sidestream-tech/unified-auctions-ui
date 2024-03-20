import { warpTime, resetNetworkAndSetupWallet } from '../../helpers/hardhat/network';
import { addDaiToBalance, addMkrToBalance } from '../../helpers/hardhat/balance';
import { Simulation } from '../types';
import { collectStabilityFees, fetchVault, liquidateVault } from '../../src/vaults';
import { TEST_NETWORK } from '../../helpers/constants';
import createVaultWithCollateral, {
    adjustLimitsAndRates,
    calculateMinCollateralAmountToOpenVault,
} from '../helpers/createVaultWithCollateral';
import promptToSelectOneOption from '../helpers/promptToSelectOneOption';
import promptToGetBlockNumber from '../helpers/promptToGetBlockNumber';
import getProvider from '../../src/provider';

import fetchAuctionsByCollateralType, { fetchMaximumAuctionDurationInSeconds } from '../../src/fetch';
import { getAllCollateralTypes } from '../../src/constants/COLLATERALS';
import { setCollateralDebtCeilingToGlobal } from '../../helpers/hardhat/contractParametrization';

const TWO_YEARS_IN_MINUTES = 60 * 24 * 30 * 12 * 2;

const simulation: Simulation = {
    title: 'Create collateral auction',
    steps: [
        {
            title: 'Reset blockchain fork',
            entry: async () => {
                const number = await promptToGetBlockNumber();
                await resetNetworkAndSetupWallet(number);
                const collateralType = await promptToSelectOneOption(
                    'Select the collateral symbol to add to the VAT.',
                    getAllCollateralTypes()
                );
                await addDaiToBalance();
                await addMkrToBalance();
                return {
                    collateralType,
                };
            },
        },
        {
            title: 'Create underwater vault',
            entry: async context => {
                await adjustLimitsAndRates(context.collateralType);
                const collateralOwned = await calculateMinCollateralAmountToOpenVault(context.collateralType);
                console.info(`Minimum collateral amount to open vault: ${collateralOwned.toFixed()}`);
                await setCollateralDebtCeilingToGlobal(context.collateralType);
                const latestVaultId = await createVaultWithCollateral(
                    context.collateralType,
                    collateralOwned.multipliedBy(1)
                );
                console.info(`Created Vault id: ${latestVaultId}`);

                console.info(`Skipping ${TWO_YEARS_IN_MINUTES} minutes...`);
                await warpTime(TWO_YEARS_IN_MINUTES, 60);

                console.info(`Collecting stability fees...`);
                const vaultBefore = await fetchVault(TEST_NETWORK, latestVaultId);
                console.info(`Stability fee before ${vaultBefore.stabilityFeeRate}`);
                await collectStabilityFees(TEST_NETWORK, context.collateralType);
                const vaultAfter = await fetchVault(TEST_NETWORK, latestVaultId);
                console.info(`Stability fee after ${vaultAfter.stabilityFeeRate}`);

                return { ...context, latestVaultId };
            },
        },
        {
            title: 'Liquidate the vault',
            entry: async context => {
                const liquidatedId = context.latestVaultId;
                const vault = await fetchVault(TEST_NETWORK, liquidatedId);
                await liquidateVault(TEST_NETWORK, vault.collateralType, vault.address);
                return context;
            },
        },
        {
            title: 'Skip time',
            entry: async context => {
                const auctionLifetime = await fetchMaximumAuctionDurationInSeconds(
                    TEST_NETWORK,
                    context.collateralType
                );
                const INITIAL_WARP_PARTS = 1 / 13;
                const warpSeconds = Math.floor(auctionLifetime * INITIAL_WARP_PARTS);
                console.info(`Initial warp of ${INITIAL_WARP_PARTS} of an auction time: ${warpSeconds} seconds`);
                await warpTime(warpSeconds, 1);
                const provider = await getProvider(TEST_NETWORK);
                const STEP_SECONDS = 30;
                while (true) {
                    const initialAuctions = await fetchAuctionsByCollateralType(TEST_NETWORK, context.collateralType);
                    if (!initialAuctions[0] || !initialAuctions[0].isActive) {
                        console.info('No active auctions are found, exiting the "evm_mine" loop');
                        break;
                    }
                    console.info(`Gradually skipping time, one block every ${STEP_SECONDS} seconds`);
                    try {
                        await provider.send('evm_mine', []);
                        await new Promise(resolve => setTimeout(resolve, STEP_SECONDS * 1000));
                    } catch (error) {
                        console.error('evm_mine failed with', error);
                    }
                }
            },
        },
    ],
};

export default simulation;

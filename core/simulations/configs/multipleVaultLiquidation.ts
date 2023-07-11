import { warpTime, resetNetworkAndSetupWallet } from '../../helpers/hardhat/network';
import { addDaiToBalance, addMkrToBalance } from '../../helpers/hardhat/balance';
import { Simulation } from '../types';
import { collectStabilityFees, fetchVault, liquidateVault } from '../../src/vaults';
import { TEST_NETWORK } from '../../helpers/constants';
import createVaultWithCollateral, {
    adjustLimitsAndRates,
    calculateMinCollateralAmountToOpenVault,
} from '../helpers/createVaultWithCollateral';
import promptToSelectMultipleOptions from '../helpers/promptToSelectMultipleOptions';
import promptToGetBlockNumber from '../helpers/promptToGetBlockNumber';

import { fetchMaximumAuctionDurationInSeconds } from '../../src/fetch';
import { getAllCollateralTypes } from '../../src/constants/COLLATERALS';
import promptNumber from '../helpers/promptNumber';

const TWO_YEARS_IN_MINUTES = 60 * 24 * 30 * 12 * 2;

const simulation: Simulation = {
    title: 'Create multiple collateral auctions',
    steps: [
        {
            title: 'Reset blockchain fork',
            entry: async () => {
                const number = await promptToGetBlockNumber();
                const vaultNumberPerCollateral = await promptNumber({
                    title: 'Number of vaults to create per collateral type',
                    min: 1,
                    max: 5,
                    initial: 1,
                });
                await resetNetworkAndSetupWallet(number);
                const collateralTypes = await promptToSelectMultipleOptions(
                    'Select the collateral symbols to add to the VAT.',
                    getAllCollateralTypes()
                );
                return {
                    collateralTypes,
                    vaultNumberPerCollateral,
                };
            },
        },
        {
            title: 'Create the vaults',
            entry: async context => {
                const types: string[] = context.collateralTypes;
                for (const type of types) {
                    await adjustLimitsAndRates(type);
                }
                const collateralsOwned = await Promise.all(
                    types.map(async type => ({
                        type,
                        minCollateralAmount: await calculateMinCollateralAmountToOpenVault(type),
                    }))
                );
                console.info(
                    `Minimum collaterals amount to open vault: ${JSON.stringify(collateralsOwned.map(c => ({
                        c: c.minCollateralAmount.toFixed(),
                    })))}`
                );
                const vaultIds: { type: string; latestVaultId: number }[] = [];
                for (const collateralOwned of collateralsOwned) {
                    let multiplier = 1;
                    for (let _i = 0; _i < context.vaultNumberPerCollateral; _i++) {
                        console.log('asdf', multiplier, collateralOwned.minCollateralAmount.toFixed(), collateralOwned.minCollateralAmount.multipliedBy(multiplier).toFixed())
                        const latestVaultId: number = await createVaultWithCollateral(
                            collateralOwned.type,
                            collateralOwned.minCollateralAmount.multipliedBy(multiplier)
                        );
                        vaultIds.push({ type: collateralOwned.type, latestVaultId });
                        console.info(`Created Vault id: ${latestVaultId}`);
                        multiplier += 1;
                    }
                }
                return { ...context, vaultIds };
            },
        },
        {
            title: 'Skip time',
            entry: async context => {
                await warpTime(TWO_YEARS_IN_MINUTES, 60);
                return context;
            },
        },
        {
            title: 'Collect stability fees',
            entry: async context => {
                const vaultIds = context.vaultIds;
                for (const vault of vaultIds) {
                    const vaultBefore = await fetchVault(TEST_NETWORK, vault.latestVaultId);
                    console.info(`stability fees before ${vaultBefore.stabilityFeeRate}`);
                    await collectStabilityFees(TEST_NETWORK, vault.type);
                    const vaultAfter = await fetchVault(TEST_NETWORK, vault.latestVaultId);
                    console.info(`stability fees after ${vaultAfter.stabilityFeeRate}`);
                }
                return context;
            },
        },
        {
            title: 'Liquidate the vault',
            entry: async context => {
                const vaultIds = context.vaultIds;
                for (const vault of vaultIds) {
                    const v = await fetchVault(TEST_NETWORK, vault.latestVaultId);
                    await liquidateVault(TEST_NETWORK, v.collateralType, v.address);
                }
                return context;
            },
        },
        {
            title: 'Skip time',
            entry: async context => {
                const auctionLifetime = await fetchMaximumAuctionDurationInSeconds(
                    TEST_NETWORK,
                    context.collateralTypes[0]
                );
                console.log(`Auction lifetime: ${auctionLifetime}`);
                const warpSeconds = Math.floor(auctionLifetime / 2);
                if (!warpSeconds) {
                    throw new Error('Auction lifetime is too short to warp time.');
                }
                console.info(`Skipping time: ${warpSeconds} seconds`);
                await warpTime(warpSeconds, 1);
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

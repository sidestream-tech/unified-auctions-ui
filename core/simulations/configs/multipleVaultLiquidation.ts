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
import promptYesNo from '../helpers/promptYesNo';

import { fetchMaximumAuctionDurationInSeconds } from '../../src/fetch';
import { getAllCollateralTypes } from '../../src/constants/COLLATERALS';
import promptNumber from '../helpers/promptNumber';
import BigNumber from '../../src/bignumber';

const TWO_YEARS_IN_MINUTES = 60 * 24 * 30 * 12 * 2;

interface SuccessfulVaultCreationOutcome {
    result: 'success';
    type: string;
    latestVaultId: number;
}

interface FailedVaultCreation {
    type: string;
    amount: string;
    error: string;
}

interface FailedVaultCreationOutcome extends FailedVaultCreation {
    result: 'error';
}

async function createVaultOrReportFailure(
    collateralType: string,
    amount: BigNumber
): Promise<SuccessfulVaultCreationOutcome | FailedVaultCreationOutcome> {
    try {
        const latestVaultId: number = await createVaultWithCollateral(collateralType, amount);
        return { type: collateralType, latestVaultId, result: 'success' };
    } catch (error) {
        return {
            result: 'error',
            type: collateralType,
            amount: amount.toFixed(),
            error: (error as Error).message || 'unknown',
        };
    }
}

async function printErrorsForVaultCreation(failedVaultCreations: FailedVaultCreation[]) {
    console.info('Some of the vaults were not created.');
    const doPrintErrors = await promptYesNo('Print blockchain errors in the list? (they can be long)');
    for (const failed of failedVaultCreations) {
        const message = `Failed to create vault with type ${failed.type} and amount ${failed.amount}`;
        console.warn(message, doPrintErrors ? failed.error : '');
    }
}

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
                if (collateralTypes.length === 0) {
                    throw new Error('No collateral types selected.');
                }
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
                    `Minimum collaterals amount to open vault: ${JSON.stringify(
                        collateralsOwned.map(c => ({
                            c: c.minCollateralAmount.toFixed(),
                        }))
                    )}`
                );
                const vaultIds: { type: string; latestVaultId: number }[] = [];
                const failedVaultCreations: { type: string; amount: string; error: string }[] = [];
                for (const collateralOwned of collateralsOwned) {
                    let multiplier = 1;
                    for (let _i = 0; _i < context.vaultNumberPerCollateral; _i++) {
                        const amount = collateralOwned.minCollateralAmount.multipliedBy(multiplier);
                        const outcome = await createVaultOrReportFailure(collateralOwned.type, amount);
                        if (outcome.result === 'success') {
                            vaultIds.push({ type: outcome.type, latestVaultId: outcome.latestVaultId });
                            console.info(`Created Vault id: ${outcome.latestVaultId}`);
                            multiplier += 1;
                            continue;
                        }
                        failedVaultCreations.push({
                            type: outcome.type,
                            amount: outcome.amount,
                            error: outcome.error,
                        });
                    }
                }
                if (failedVaultCreations.length !== 0) {
                    await printErrorsForVaultCreation(failedVaultCreations);
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

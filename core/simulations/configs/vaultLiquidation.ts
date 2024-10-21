import { warpTime, resetNetworkAndSetupWallet } from '../../helpers/hardhat/network';
import { addDaiToBalance, addMkrToBalance } from '../../helpers/hardhat/balance';
import { Simulation } from '../types';
import { collectStabilityFees, liquidateVault } from '../../src/vaults';
import { TEST_NETWORK } from '../../helpers/constants';
import createVaultWithCollateral, {
    adjustLimitsAndRates,
    calculateMinCollateralAmountToOpenVault,
} from '../helpers/createVaultWithCollateral';
import promptToSelectOneOption from '../helpers/promptToSelectOneOption';
import { promptToGetNumber, promptToGetBlockNumber } from '../helpers/promptToGetNumber';
import getProvider from '../../src/provider';
import fetchAuctionsByCollateralType, { fetchMaximumAuctionDurationInSeconds } from '../../src/fetch';
import { getAllCollateralTypes, getCollateralConfigByType } from '../../src/constants/COLLATERALS';
import { setCollateralDebtCeilingToGlobal } from '../../helpers/hardhat/contractParametrization';
import { getCurrentOraclePriceByCollateralType } from '../../src/oracles';
import { overwriteCurrentOraclePrice } from '../../helpers/hardhat/overwrites';
import BigNumber from 'bignumber.js';
import { enrichAuction } from '../../src/auctions';
import { overwriteUintValue } from '../../helpers/hardhat/slotOverwrite';
import { RAY } from '../../src/constants/UNITS';

const simulation: Simulation = {
    title: 'Create collateral auction',
    steps: [
        {
            title: 'Reset blockchain fork',
            entry: async () => {
                const number = await promptToGetBlockNumber();
                await resetNetworkAndSetupWallet(number);
                await addDaiToBalance();
                await addMkrToBalance();
                const collateralType = await promptToSelectOneOption(
                    'Select the collateral type',
                    getAllCollateralTypes()
                );
                return {
                    collateralType,
                };
            },
        },
        {
            title: 'Create underwater vault',
            entry: async context => {
                // set oracle price
                await overwriteCurrentOraclePrice(TEST_NETWORK, context.collateralType, new BigNumber(1000));
                const initialOraclePrice = await getCurrentOraclePriceByCollateralType(
                    TEST_NETWORK,
                    context.collateralType
                );
                console.info(`Initial oracle price is ${initialOraclePrice.toFixed()} DAI`);

                await adjustLimitsAndRates(context.collateralType);
                const collateralOwned = await calculateMinCollateralAmountToOpenVault(context.collateralType);
                console.info(`Minimum collateral amount to open vault: ${collateralOwned.toFixed()}`);
                await setCollateralDebtCeilingToGlobal(context.collateralType);
                const { vaultIndex, vaultAddress } = await createVaultWithCollateral(
                    context.collateralType,
                    collateralOwned.multipliedBy(1)
                );
                console.info(`Created Vault with id ${vaultIndex} and address ${vaultAddress}`);

                // drop oracle price
                console.info(`Initial oracle price is ${initialOraclePrice.toFixed()} DAI`);
                await overwriteCurrentOraclePrice(TEST_NETWORK, context.collateralType, initialOraclePrice.times(0.5));
                const newOraclePrice = await getCurrentOraclePriceByCollateralType(
                    TEST_NETWORK,
                    context.collateralType
                );
                console.info(`New oracle price is ${newOraclePrice.toFixed()} DAI`);
                await collectStabilityFees(TEST_NETWORK, context.collateralType);

                return { ...context, vaultIndex, vaultAddress, initialOraclePrice };
            },
        },
        {
            title: 'Liquidate the vault',
            entry: async context => {
                const collateralConfig = getCollateralConfigByType(context.collateralType);
                try {
                    // overwrite calc.tau (linear auction price reduction duration)
                    await overwriteUintValue(collateralConfig.contracts.calc, '0x1', new BigNumber(3000));
                } catch {}
                try {
                    // overwrite clip.buf (initial auction price multiplier)
                    await overwriteUintValue(collateralConfig.contracts.clip, '0x5', RAY.dividedBy(50));
                } catch {}
                // liquidate
                await liquidateVault(TEST_NETWORK, context.collateralType, context.vaultAddress);
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
                let proposedSecondsToWarp = Math.floor(auctionLifetime / 12);
                const provider = await getProvider(TEST_NETWORK);
                while (true) {
                    proposedSecondsToWarp = await promptToGetNumber({
                        title: 'Number of seconds to warp',
                        initial: proposedSecondsToWarp,
                        max: auctionLifetime,
                    });
                    if (proposedSecondsToWarp === 0) {
                        try {
                            await provider.send('evm_mine', []);
                            console.info(`Mined one block without skipping any time`);
                        } catch (error) {
                            console.error('evm_mine failed with', error);
                        }
                    } else {
                        await warpTime(proposedSecondsToWarp, 1);
                        console.info(`Skipped ${proposedSecondsToWarp} seconds`);
                    }
                    const initialAuctions = await fetchAuctionsByCollateralType(TEST_NETWORK, context.collateralType);
                    if (!initialAuctions[0]) {
                        console.info('No active auctions are found, exiting the "evm_mine" loop');
                        break;
                    }
                    const auction = await enrichAuction(TEST_NETWORK, initialAuctions[0]);
                    if (!auction?.isActive) {
                        console.info('No active auctions are found, exiting the "evm_mine" loop');
                        break;
                    }
                    console.info(`One active auction is still present: ${auction.id}`);
                }
            },
        },
    ],
};

export default simulation;

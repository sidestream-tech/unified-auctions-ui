import { SurplusAuctionActive } from 'auctions-core/src/types';
import { bidToSurplusAuction, enrichSurplusAuction, collectSurplusAuction } from 'auctions-core/src/surplus';
import getSigner from 'auctions-core/src/signer';
import { fetchAllowanceAmountMKR, setAllowanceAmountMKR } from 'auctions-core/src/authorizations';
import { fetchBalanceMKR } from 'auctions-core/src/wallet';
import { formatToAutomaticDecimalPointsString } from 'auctions-core/src/helpers/formatToAutomaticDecimalPoints';
import { KEEPER_MAXIMUM_MKR_PER_DAI_SURPLUS } from '../variables';
import { isSetupCompleted } from './setup';
import BigNumber from '~/../core/src/bignumber';

const currentlyExecutedAuctions = new Set();

const checkAndParticipateIfPossible = async function (network: string, auction: SurplusAuctionActive) {
    // check if setupKeeper hasn't run
    if (!isSetupCompleted) {
        return;
    }

    const signer = await getSigner(network);
    const walletAddress = await signer.getAddress();

    // enrich the auction with more numbers
    const auctionTransaction = await enrichSurplusAuction(network, auction);

    // check if auction became inactive or finished
    if (auctionTransaction.state === 'ready-for-collection') {
        console.info(`keeper: surplus auction "${auction.id}" has already finished`);
        // check if the current user is the winner
        if (auctionTransaction.receiverAddress === walletAddress) {
            console.info(
                `keeper: wallet ${walletAddress} won surplus auction "${auction.id}", moving on to collection`
            );
            await collectSurplusAuction(network, auction.id);
            console.info(`keeper: surplus auction "${auction.id}" was successfully collected`);
        }
        return;
    }
    if (auctionTransaction.state === 'requires-restart') {
        console.info(`keeper: surplus auction "${auction.id}" is inactive`);
        return;
    }

    // check auction's unit price
    const unitPriceDifference = auctionTransaction.marketUnitPrice.minus(auctionTransaction.unitPrice);
    if (unitPriceDifference.isLessThan(0)) {
        console.info(
            `keeper: surplus auction "${
                auction.id
            }" is not yet profitable (current unit price difference: ${formatToAutomaticDecimalPointsString(
                unitPriceDifference,
                6
            )} MKR per DAI)`
        );
        return;
    }

    // check auction's clear unit price – unit price with transaction fees
    const clearUnitPrice = auctionTransaction.nextMinimumBid.div(
        auctionTransaction.receiveAmountDAI.minus(auctionTransaction.combinedBidFeesDai)
    );
    if (clearUnitPrice.isGreaterThan(new BigNumber(KEEPER_MAXIMUM_MKR_PER_DAI_SURPLUS))) {
        console.info(
            `keeper: surplus auction "${
                auction.id
            }" clear unit price is higher than max unit price (${formatToAutomaticDecimalPointsString(
                clearUnitPrice,
                6
            )} > ${KEEPER_MAXIMUM_MKR_PER_DAI_SURPLUS})`
        );
        return;
    } else {
        console.info(
            `keeper: surplus auction "${auction.id}" clear unit price is ${formatToAutomaticDecimalPointsString(
                clearUnitPrice,
                6
            )} MKR per DAI after transaction fees, checking wallet MKR balance`
        );
    }

    // check the wallet's MKR balance
    const balanceMkr = await fetchBalanceMKR(network, walletAddress);
    if (balanceMkr.isLessThan(auctionTransaction.nextMinimumBid)) {
        console.info(
            `keeper: wallet MKR balance (${formatToAutomaticDecimalPointsString(
                balanceMkr
            )}) is less than min bid amount (${formatToAutomaticDecimalPointsString(
                auctionTransaction.nextMinimumBid
            )})`
        );
        return;
    } else {
        console.info('keeper: wallet MKR balance is within limits, checking wallet MKR allowance');
    }

    // check the wallet's MKR allowance
    const allowanceMkr = await fetchAllowanceAmountMKR(network, walletAddress);
    if (allowanceMkr.isLessThan(auctionTransaction.nextMinimumBid)) {
        console.info(
            `keeper: wallet MKR allowance (${formatToAutomaticDecimalPointsString(
                allowanceMkr
            )}) is less than desired bid amount (${formatToAutomaticDecimalPointsString(
                auctionTransaction.nextMinimumBid
            )}), increasing wallet MKR allowance`
        );
        await setAllowanceAmountMKR(network, walletAddress, auctionTransaction.nextMinimumBid);
        await checkAndParticipateIfPossible(network, auction);
        return;
    } else {
        console.info('keeper: wallet MKR allowance is within limits, moving on to execution');
    }

    // bid on the Auction
    console.info(`keeper: surplus auction "${auctionTransaction.id}": attempting bid execution`);
    await bidToSurplusAuction(network, auctionTransaction.id, auctionTransaction.nextMinimumBid);
    console.info(`keeper: surplus auction "${auctionTransaction.id}" was succesfully executed`);
};

const participateInAuction = async function (network: string, auction: SurplusAuctionActive) {
    // check if this auction is currently executed to avoid double execution
    if (currentlyExecutedAuctions.has(auction.id)) {
        return;
    }
    currentlyExecutedAuctions.add(auction.id);

    // execute
    try {
        await checkAndParticipateIfPossible(network, auction);
    } catch (error) {
        console.error(`keeper: unexpected error: ${(error instanceof Error && error.message) || 'unknown'}`);
    }

    // clear pool of currently executed auctions
    currentlyExecutedAuctions.delete(auction.id);
};

export const participate = async function (network: string, auctions: SurplusAuctionActive[]) {
    for (const auction of auctions) {
        await participateInAuction(network, auction);
    }
};

export default participate;

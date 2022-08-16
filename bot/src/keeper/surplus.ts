import { SurplusAuctionActive } from 'auctions-core/src/types';
import { bidToSurplusAuction, enrichSurplusAuction } from 'auctions-core/src/surplus';
import getSigner from 'auctions-core/src/signer';
import { fetchAllowanceAmountMKR, setAllowanceAmountMKR } from 'auctions-core/src/authorizations';
import { KEEPER_MINIMUM_NET_PROFIT_DAI } from '../variables';
import { isSetupCompleted } from './setup';
import BigNumber from '~/../core/src/bignumber';

const currentlyExecutedAuctions = new Set();

const checkAndParticipateIfPossible = async function (network: string, auction: SurplusAuctionActive) {
    // check if setupKeeper hasn't run
    if (!isSetupCompleted) {
        return;
    }

    const signer = await getSigner(network);

    // enrich the auction with more numbers
    const auctionTransaction = await enrichSurplusAuction(network, auction);

    // check if auction became inactive or finished
    if (auctionTransaction.state === 'ready-for-collection') {
        console.info(`keeper: surplus auction "${auction.id}" has already finished`);
        return;
    }
    if (auctionTransaction.state === 'requires-restart') {
        console.info(`keeper: surplus auction "${auction.id}" is inactive`);
        return;
    }

    // check auction's profit
    const profit = new BigNumber(1)
        .div(auctionTransaction.marketUnitPrice.minus(auctionTransaction.unitPrice))
        .times(auctionTransaction.bidAmountMKR);
    if (profit.isLessThan(0)) {
        console.info(
            `keeper: surplus auction "${auction.id}" is not yet profitable (current profit: ${profit.toFixed(0)} DAI)`
        );
        return;
    }

    // check auction's clear profit – profit without transaction fees
    const clearProfit = profit.minus(auctionTransaction.combinedBidFeesDai);
    if (clearProfit.isLessThan(new BigNumber(KEEPER_MINIMUM_NET_PROFIT_DAI))) {
        console.info(
            `keeper: surplus auction "${auction.id}" clear profit is smaller than min profit (${clearProfit.toFixed(
                0
            )} < ${KEEPER_MINIMUM_NET_PROFIT_DAI})`
        );
        return;
    } else {
        console.info(
            `keeper: surplus auction "${auction.id}" clear profit is ${clearProfit.toFixed(
                0
            )} DAI after transaction fees, checking wallet MKR allowance`
        );
    }

    const walletAddress = await signer.getAddress();

    // check the wallet's MKR allowance
    const allowance = await fetchAllowanceAmountMKR(network, walletAddress);
    if (allowance.isLessThan(auctionTransaction.bidAmountMKR)) {
        console.info(
            `keeper: wallet MKR allowance (${allowance.toFixed(
                0
            )}) is less than desired bid amount (${auctionTransaction.bidAmountMKR.toFixed(
                0
            )}), increasing wallet MKR allowance`
        );
        await setAllowanceAmountMKR(network, walletAddress, auctionTransaction.bidAmountMKR);
        await checkAndParticipateIfPossible(network, auction);
        return;
    } else {
        console.info('keeper: wallet MKR allowance is within limits, moving on to execution');
    }

    // bid on the Auction
    console.info(`keeper: surplus auction "${auctionTransaction.id}": attempting bid execution`);
    await bidToSurplusAuction(network, auctionTransaction.id, auctionTransaction.bidAmountMKR);
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

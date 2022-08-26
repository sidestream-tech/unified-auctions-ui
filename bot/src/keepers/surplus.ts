import BigNumber from 'auctions-core/src/bignumber';
import { SurplusAuctionActive } from 'auctions-core/src/types';
import { bidToSurplusAuction, enrichSurplusAuction, collectSurplusAuction } from 'auctions-core/src/surplus';
import getSigner from 'auctions-core/src/signer';
import { fetchAllowanceAmountMKR, setAllowanceAmountMKR } from 'auctions-core/src/authorizations';
import { fetchBalanceMKR } from 'auctions-core/src/wallet';
import { formatToAutomaticDecimalPointsString } from 'auctions-core/src/helpers/formatToAutomaticDecimalPoints';
import { KEEPER_SURPLUS_MINIMUM_NET_PROFIT_DAI } from '../variables';
import { setupWallet } from '../signer';

let isSetupCompleted = false;
const currentlyExecutedAuctions = new Set();

export const setupSurplusKeeper = async function (network: string) {
    await setupWallet(network);
    if (Number.isNaN(KEEPER_SURPLUS_MINIMUM_NET_PROFIT_DAI)) {
        console.info(
            'surplus keeper: no KEEPER_SURPLUS_MINIMUM_NET_PROFIT_DAI env variable provided, keeper will not run'
        );
        return;
    }
    console.info(
        `surplus keeper: setup complete, looking for minimum clear profit of "${KEEPER_SURPLUS_MINIMUM_NET_PROFIT_DAI}" DAI`
    );
    isSetupCompleted = true;
};

const checkAndParticipateIfPossible = async function (network: string, auction: SurplusAuctionActive) {
    // check if setupSurplusKeeper hasn't run
    if (!isSetupCompleted) {
        return;
    }

    const signer = await getSigner(network);
    const walletAddress = await signer.getAddress();

    // enrich the auction with more numbers
    const auctionTransaction = await enrichSurplusAuction(network, auction);

    // check if auction became inactive or finished
    if (auctionTransaction.state === 'ready-for-collection') {
        // check if the current user is the winner
        if (auctionTransaction.receiverAddress.toLocaleLowerCase() === walletAddress.toLowerCase()) {
            console.info(
                `surplus keeper: wallet "${walletAddress}" won auction "${auction.id}", moving on to collection`
            );
            await collectSurplusAuction(network, auction.id);
            console.info(`surplus keeper: auction "${auction.id}" was successfully collected`);
            return;
        } else {
            console.info(
                `surplus keeper: auction "${auction.id}" has already finished and the winner is not "${walletAddress}"`
            );
            return;
        }
    }
    if (auctionTransaction.state === 'requires-restart') {
        console.info(`surplus keeper: auction "${auction.id}" is inactive`);
        return;
    }

    // check auction's clear profit – profit without transaction fees
    const clearProfit = new BigNumber(1)
        .div(auctionTransaction.marketUnitPrice.minus(auctionTransaction.unitPrice))
        .times(auctionTransaction.nextMinimumBid)
        .minus(auctionTransaction.combinedBidFeesDai);
    if (clearProfit.isLessThan(new BigNumber(KEEPER_SURPLUS_MINIMUM_NET_PROFIT_DAI))) {
        console.info(
            `surplus keeper: auction "${
                auction.id
            }" clear profit is smaller than min profit (${formatToAutomaticDecimalPointsString(
                clearProfit
            )} < ${KEEPER_SURPLUS_MINIMUM_NET_PROFIT_DAI})`
        );
        return;
    } else {
        console.info(
            `surplus keeper: auction "${auction.id}" clear profit is ${formatToAutomaticDecimalPointsString(
                clearProfit
            )} DAI after transaction fees, checking wallet MKR balance`
        );
    }

    // check the wallet's MKR balance
    const balanceMkr = await fetchBalanceMKR(network, walletAddress);
    if (balanceMkr.isLessThan(auctionTransaction.nextMinimumBid)) {
        console.info(
            `surplus keeper: wallet MKR balance (${formatToAutomaticDecimalPointsString(
                balanceMkr
            )}) is less than min bid amount (${formatToAutomaticDecimalPointsString(
                auctionTransaction.nextMinimumBid
            )}) for auction "${auction.id}"`
        );
        return;
    } else {
        console.info('surplus keeper: wallet MKR balance is within limits, checking wallet MKR allowance');
    }

    // check the wallet's MKR allowance
    const allowanceMkr = await fetchAllowanceAmountMKR(network, walletAddress);
    if (allowanceMkr.isLessThan(auctionTransaction.nextMinimumBid)) {
        console.info(
            `surplus keeper: wallet MKR allowance (${formatToAutomaticDecimalPointsString(
                allowanceMkr
            )}) is less than desired bid amount (${formatToAutomaticDecimalPointsString(
                auctionTransaction.nextMinimumBid
            )}), increasing wallet MKR allowance`
        );
        await setAllowanceAmountMKR(network, walletAddress, auctionTransaction.nextMinimumBid);
        await checkAndParticipateIfPossible(network, auction);
        return;
    } else {
        console.info('surplus keeper: wallet MKR allowance is within limits, moving on to execution');
    }

    // bid on the Auction
    console.info(`surplus keeper: auction "${auctionTransaction.id}": attempting bid execution`);
    await bidToSurplusAuction(network, auctionTransaction.id, auctionTransaction.nextMinimumBid);
    console.info(`surplus keeper: auction "${auctionTransaction.id}" was succesfully executed`);
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
        console.error(`surplus keeper: unexpected error: ${(error instanceof Error && error.message) || 'unknown'}`);
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

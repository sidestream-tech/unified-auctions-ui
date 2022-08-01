import type { Notifier, SurplusAuction, SurplusAuctionActive, SurplusAuctionTransaction } from './types';
import { getCompensationAuctionTransactionFees } from './types';
import BigNumber from './bignumber';
import getContract from './contracts';
import { RAD_NUMBER_OF_DIGITS, WAD_NUMBER_OF_DIGITS } from './constants/UNITS';
import executeTransaction from './execute';
import {
    getActiveCompensationAuctionOrUndefined,
    getCompensationAuctionBidIncreaseCoefficient,
    getCompensationAuctionLastIndex,
    getMarketPriceMkr,
} from './compensationAuction';

const CONTRACT = 'MCD_FLAP';
export const fetchActiveSurplusAuctions = async function (network: string): Promise<SurplusAuction[]> {
    const contract = await getContract(network, CONTRACT);
    const auctionLastIndex = await getCompensationAuctionLastIndex(contract);

    const surplusAuctions: SurplusAuction[] = [];
    let currentSurplusAuction;
    for (let i = auctionLastIndex; i > 0; i--) {
        currentSurplusAuction = await getActiveCompensationAuctionOrUndefined(network, i);
        if (!currentSurplusAuction) {
            break;
        }
        surplusAuctions.push(currentSurplusAuction as SurplusAuction);
    }
    return surplusAuctions;
};

export const restartSurplusAuction = async function (
    network: string,
    auctionIndex: number,
    notifier?: Notifier
): Promise<void> {
    await executeTransaction(network, CONTRACT, 'tick', [auctionIndex], { notifier });
};

export const bidToSurplusAuction = async function (
    network: string,
    auctionIndex: number,
    bid: BigNumber,
    notifier?: Notifier
) {
    const auction = (await getActiveCompensationAuctionOrUndefined(network, auctionIndex)) as
        | SurplusAuctionActive
        | undefined;
    if (!auction || !auction.receiveAmountDAI) {
        throw new Error('Did not find the auction to bid on.');
    }
    const transactionParameters = [
        auctionIndex,
        auction.receiveAmountDAI.shiftedBy(RAD_NUMBER_OF_DIGITS).toFixed(0),
        bid.shiftedBy(WAD_NUMBER_OF_DIGITS).toFixed(0),
    ];
    await executeTransaction(network, CONTRACT, 'tend', transactionParameters, { notifier });
};

export const collectSurplusAuction = async function (network: string, auctionIndex: number, notifier?: Notifier) {
    const auction = await getActiveCompensationAuctionOrUndefined(network, auctionIndex);
    if (!auction || auction.state !== 'ready-for-collection') {
        throw new Error('Did not find the auction to collect.');
    }
    await executeTransaction(network, CONTRACT, 'deal', [auctionIndex], { notifier });
};

export const getNextMinimumBid = async (network: string, surplusAuction: SurplusAuctionActive): Promise<BigNumber> => {
    const increaseCoefficient = await getCompensationAuctionBidIncreaseCoefficient(network);
    return surplusAuction.bidAmountMKR.multipliedBy(increaseCoefficient);
};

export const enrichSurplusAuction = async (
    network: string,
    auction: SurplusAuctionActive
): Promise<SurplusAuctionTransaction> => {
    const nextMinimumBid = await getNextMinimumBid(network, auction);
    const unitPrice = auction.bidAmountMKR.div(auction.receiveAmountDAI);
    const marketUnitPrice = await getMarketPriceMkr(network, auction.bidAmountMKR);
    const marketUnitPriceToUnitPriceRatio = unitPrice.minus(marketUnitPrice).dividedBy(marketUnitPrice);
    const fees = await getCompensationAuctionTransactionFees(network);
    return {
        ...auction,
        ...fees,
        nextMinimumBid,
        unitPrice,
        marketUnitPrice,
        marketUnitPriceToUnitPriceRatio,
    };
};

export const enrichSurplusAuctions = async (
    network: string,
    auctions: SurplusAuction[]
): Promise<SurplusAuction[]> => {
    const auctionsWithNextMinimumBidsPromises = auctions.map(auction => {
        if (auction.state === 'collected') {
            return auction;
        }
        return enrichSurplusAuction(network, auction);
    });
    return await Promise.all(auctionsWithNextMinimumBidsPromises);
};

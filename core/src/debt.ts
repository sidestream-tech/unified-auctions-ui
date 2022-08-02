import type { DebtAuction, DebtAuctionActive, DebtAuctionTransaction, Notifier } from './types';
import { getCompensationAuctionTransactionFees } from './types';
import BigNumber from './bignumber';
import getContract from './contracts';
import { RAD_NUMBER_OF_DIGITS, WAD_NUMBER_OF_DIGITS } from './constants/UNITS';
import executeTransaction from './execute';
import {
    collectCompensationAuction,
    getActiveCompensationAuctionOrUndefined,
    getCompensationAuctionBidIncreaseCoefficient,
    getCompensationAuctionLastIndex,
    getMarketPriceMkr,
    restartCompensationAuction,
} from './compensationAuction';

const CONTRACT = 'MCD_FLOP';
export const getNextMaximumLotReceived = async (
    network: string,
    debtAuction: DebtAuctionActive
): Promise<BigNumber> => {
    const increaseCoefficient = await getCompensationAuctionBidIncreaseCoefficient(network, CONTRACT);
    return debtAuction.receiveAmountMKR.dividedBy(increaseCoefficient);
};

export const fetchActiveDebtAuctions = async function (network: string): Promise<DebtAuctionActive[]> {
    const contract = await getContract(network, CONTRACT);
    const auctionLastIndex = await getCompensationAuctionLastIndex(contract);

    const surplusAuctions: DebtAuctionActive[] = [];
    let currentSurplusAuction;
    for (let i = auctionLastIndex; i > 0; i--) {
        const currentAuction = await getActiveCompensationAuctionOrUndefined(network, i, CONTRACT);
        if (!currentSurplusAuction) {
            break;
        }
        surplusAuctions.push(currentAuction as DebtAuctionActive);
    }
    return surplusAuctions;
};

export const restartDebtAuction = async function (
    network: string,
    auctionIndex: number,
    notifier?: Notifier
): Promise<void> {
    await restartCompensationAuction(network, auctionIndex, CONTRACT, notifier);
};

export const bidToDebtAuction = async function (
    network: string,
    auctionIndex: number,
    lot: BigNumber,
    notifier?: Notifier
) {
    const auction = (await getActiveCompensationAuctionOrUndefined(network, auctionIndex, CONTRACT)) as
        | DebtAuctionActive
        | undefined;
    if (!auction || !auction.receiveAmountMKR) {
        throw new Error('Did not find the auction to bid on.');
    }
    const transactionParameters = [
        auctionIndex,
        lot.shiftedBy(WAD_NUMBER_OF_DIGITS).toFixed(0),
        auction.bidAmountDai.shiftedBy(RAD_NUMBER_OF_DIGITS).toFixed(0),
    ];
    await executeTransaction(network, CONTRACT, 'dent', transactionParameters, { notifier });
};
export const collectDebtAuction = async (network: string, auctionIndex: number, notifier?: Notifier) => {
    await collectCompensationAuction(network, auctionIndex, CONTRACT, notifier);
};
export const enrichDebtAuction = async (
    network: string,
    auction: DebtAuctionActive
): Promise<DebtAuctionTransaction> => {
    const nextMaximumLotReceived = await getNextMaximumLotReceived(network, auction);
    const unitPrice = auction.bidAmountDai.div(auction.receiveAmountMKR);
    const marketUnitPrice = await getMarketPriceMkr(network, auction.bidAmountDai);
    const marketUnitPriceToUnitPriceRatio = unitPrice.minus(marketUnitPrice).dividedBy(marketUnitPrice);
    const fees = await getCompensationAuctionTransactionFees(network);
    return {
        ...auction,
        ...fees,
        nextMaximumLotReceived,
        unitPrice,
        marketUnitPrice,
        marketUnitPriceToUnitPriceRatio,
    };
};

export const enrichDebtAuctions = async (network: string, auctions: DebtAuction[]): Promise<DebtAuction[]> => {
    const auctionsWithNextMinimumBidsPromises = auctions.map(auction => {
        if (auction.state === 'collected') {
            return auction;
        }
        return enrichDebtAuction(network, auction);
    });
    return await Promise.all(auctionsWithNextMinimumBidsPromises as Promise<DebtAuctionTransaction>[]);
};

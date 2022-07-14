import type { Notifier, SurplusAuction, SurplusAuctionBase, SurplusAuctionTransaction } from './types';
import { getEarliestDate } from './helpers/getEarliestDate';
import BigNumber from './bignumber';
import getContract from './contracts';
import { Contract } from 'ethers';
import getNetworkDate from './date';
import { RAD, WAD, WAD_NUMBER_OF_DIGITS, RAD_NUMBER_OF_DIGITS, MKR_NUMBER_OF_DIGITS } from './constants/UNITS';
import executeTransaction from './execute';
import memoizee from 'memoizee';

const getSurplusAuctionLastIndex = async (contract: Contract): Promise<number> => {
    const auctionsQuantityBinary = await contract.kicks();
    return new BigNumber(auctionsQuantityBinary._hex).toNumber();
};

const _getSurplusAuctionBidIncreaseCoefficient = async (network: string): Promise<BigNumber> => {
    const contract = await getContract(network, 'MCD_FLAP');
    const auctionsQuantityBinary = await contract.beg();
    return new BigNumber(auctionsQuantityBinary._hex).shiftedBy(-MKR_NUMBER_OF_DIGITS);
};

const getSurplusAuctionBidIncreaseCoefficient = memoizee(_getSurplusAuctionBidIncreaseCoefficient, {
    promise: true,
    length: 3,
});

export const getNextMinimumBid = async (
    network: string,
    surplusAuction: SurplusAuction
): Promise<BigNumber | undefined> => {
    if (!surplusAuction.bidAmountMKR) {
        return undefined;
    }
    const increaseCoefficient = await getSurplusAuctionBidIncreaseCoefficient(network);
    return surplusAuction.bidAmountMKR.multipliedBy(increaseCoefficient);
};

const getAuctionState = async (network: string, earliestEndDate: Date, greatestBid: number) => {
    const isBidExpired = (await getNetworkDate(network)) > earliestEndDate;
    const haveBids = greatestBid !== 0;
    if (haveBids) {
        if (isBidExpired) {
            return 'ready-for-collection';
        }
        return 'have-bids';
    }
    if (isBidExpired) {
        return 'requires-restart';
    }
    return 'just-started';
};

export const fetchSurplusAuctionByIndex = async function (
    network: string,
    auctionIndex: number
): Promise<SurplusAuction> {
    const contract = await getContract(network, 'MCD_FLAP');
    const auctionData = await contract.bids(auctionIndex);
    const isAuctionCollected = new BigNumber(auctionData.end).eq(0);
    const fetchedAt = new Date();
    const baseAuctionInfo: SurplusAuctionBase = {
        network,
        id: auctionIndex,
    };

    if (isAuctionCollected) {
        const auctionLastIndex = await getSurplusAuctionLastIndex(contract);
        if (auctionLastIndex < auctionIndex) {
            throw new Error('No active auction exists with this id');
        }
        return { ...baseAuctionInfo, state: 'collected', fetchedAt };
    }

    const auctionEndDate = new Date(auctionData.end * 1000);
    const bidEndDate = auctionData.tic ? new Date(auctionData.tic * 1000) : undefined;
    const earliestEndDate = bidEndDate ? getEarliestDate(auctionEndDate, bidEndDate) : auctionEndDate;
    const state = await getAuctionState(network, earliestEndDate, auctionData.tic);

    return {
        ...baseAuctionInfo,
        earliestEndDate,
        bidAmountMKR: new BigNumber(auctionData.bid._hex).div(WAD),
        receiveAmountDAI: new BigNumber(auctionData.lot._hex).div(RAD),
        receiverAddress: auctionData.guy,
        auctionEndDate,
        bidEndDate,
        state,
        fetchedAt,
    };
};

const getActiveSurplusAuctionOrUndefined = async (network: string, auctionIndex: number) => {
    const auction = await fetchSurplusAuctionByIndex(network, auctionIndex);
    if (auction.state === 'collected') {
        return;
    }
    return auction;
};

export const fetchActiveSurplusAuctions = async function (network: string): Promise<SurplusAuction[]> {
    const contract = await getContract(network, 'MCD_FLAP');
    const auctionLastIndex = await getSurplusAuctionLastIndex(contract);

    const surplusAuctions: SurplusAuction[] = [];
    let currentSurplusAuction;
    for (let i = auctionLastIndex; i > 0; i--) {
        currentSurplusAuction = await getActiveSurplusAuctionOrUndefined(network, i);
        if (!currentSurplusAuction) {
            break;
        }
        surplusAuctions.push(currentSurplusAuction);
    }
    return surplusAuctions;
};

export const restartSurplusAuction = async function (
    network: string,
    auctionIndex: number,
    notifier?: Notifier
): Promise<void> {
    await executeTransaction(network, 'MCD_FLAP', 'tick', [auctionIndex], { notifier });
};

export const bidToSurplusAuction = async function (
    network: string,
    auctionIndex: number,
    bet: string,
    notifier?: Notifier
) {
    const auction = await getActiveSurplusAuctionOrUndefined(network, auctionIndex);
    if (!auction || !auction.receiveAmountDAI) {
        throw new Error('Did not find the auction to bid on.');
    }
    const transactionParameters = [
        auctionIndex,
        auction.receiveAmountDAI.shiftedBy(RAD_NUMBER_OF_DIGITS).toFixed(0),
        new BigNumber(bet).shiftedBy(WAD_NUMBER_OF_DIGITS).toFixed(0),
    ];
    await executeTransaction(network, 'MCD_FLAP', 'tend', transactionParameters, { notifier });
};

export const collectSurplusAuction = async function (network: string, auctionIndex: number, notifier?: Notifier) {
    const auction = await getActiveSurplusAuctionOrUndefined(network, auctionIndex);
    if (!auction || auction.state !== 'ready-for-collection') {
        throw new Error('Did not find the auction to collect.');
    }
    await executeTransaction(network, 'MCD_FLAP', 'deal', [auctionIndex], { notifier });
};

export const enrichSurplusAuctionWithMinimumBid = async (
    network: string,
    auction: SurplusAuction
): Promise<SurplusAuctionTransaction> => {
    const nextMinimumBid = await getNextMinimumBid(network, auction);
    return {
        ...auction,
        nextMinimumBid,
    };
};

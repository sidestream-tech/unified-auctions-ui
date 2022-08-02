import { Contract } from 'ethers';
import BigNumber from 'bignumber.js';
import getContract from './contracts';
import { MKR_NUMBER_OF_DIGITS, RAD, WAD } from './constants/UNITS';
import memoizee from 'memoizee';
import getNetworkDate from './date';
import { CompensationAuctionBase, DebtAuction, Notifier, SurplusAuction } from './types';
import { getEarliestDate } from './helpers/getEarliestDate';
import executeTransaction from './execute';
import { convertMkrToDai } from './calleeFunctions/helpers/uniswapV3';

export const getCompensationAuctionLastIndex = async (contract: Contract): Promise<number> => {
    const auctionsQuantityBinary = await contract.kicks();
    return new BigNumber(auctionsQuantityBinary._hex).toNumber();
};

const _getCompensationAuctionBidIncreaseCoefficient = async (
    network: string,
    contractName: 'MCD_FLAP' | 'MCD_FLOP'
): Promise<BigNumber> => {
    const contract = await getContract(network, contractName);
    const auctionsQuantityBinary = await contract.beg();
    return new BigNumber(auctionsQuantityBinary._hex).shiftedBy(-MKR_NUMBER_OF_DIGITS);
};

export const getCompensationAuctionBidIncreaseCoefficient = memoizee(_getCompensationAuctionBidIncreaseCoefficient, {
    promise: true,
    length: 3,
});

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
export const fetchCompensationAuctionByIndex = async (
    network: string,
    auctionIndex: number,
    contractName: 'MCD_FLAP' | 'MCD_FLOP'
): Promise<SurplusAuction | DebtAuction> => {
    const contract = await getContract(network, contractName);
    const auctionData = await contract.bids(auctionIndex);
    const isAuctionCollected = new BigNumber(auctionData.end).eq(0);
    const fetchedAt = new Date();
    const baseAuctionInfo: CompensationAuctionBase = {
        network,
        id: auctionIndex,
        fetchedAt,
    };

    if (isAuctionCollected) {
        const auctionLastIndex = await getCompensationAuctionLastIndex(contract);
        if (auctionLastIndex < auctionIndex) {
            throw new Error('No active auction exists with this id');
        }
        return { ...baseAuctionInfo, state: 'collected' };
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

export const getActiveCompensationAuctionOrUndefined = async (
    network: string,
    auctionIndex: number,
    contractName: 'MCD_FLAP' | 'MCD_FLOP'
) => {
    const auction = await fetchCompensationAuctionByIndex(network, auctionIndex, contractName);
    if (auction.state === 'collected') {
        return;
    }
    return auction;
};

export const restartCompensationAuction = async function (
    network: string,
    auctionIndex: number,
    contractName: 'MCD_FLOP' | 'MCD_FLAP',
    notifier?: Notifier
): Promise<void> {
    await executeTransaction(network, contractName, 'tick', [auctionIndex], { notifier });
};

export const getMarketPriceMkr = async function (network: string, mkrAmount: BigNumber): Promise<BigNumber> {
    try {
        return new BigNumber(1).div((await convertMkrToDai(network, mkrAmount)).div(mkrAmount));
    } catch (error) {
        return new BigNumber(NaN);
    }
};

export const collectCompensationAuction = async function (
    network: string,
    auctionIndex: number,
    contractName: 'MCD_FLAP' | 'MCD_FLOP',
    notifier?: Notifier
) {
    const auction = await getActiveCompensationAuctionOrUndefined(network, auctionIndex, contractName);
    if (!auction || auction.state !== 'ready-for-collection') {
        throw new Error('Did not find the auction to collect.');
    }
    await executeTransaction(network, contractName, 'deal', [auctionIndex], { notifier });
};

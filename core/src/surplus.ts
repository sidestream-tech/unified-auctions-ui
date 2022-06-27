import type { SurplusAuction, SurplusAuctionCollected, SurplusAuctionBase } from './types';
import { getEarliestDate } from './helpers/getEarliestDate';
import BigNumber from './bignumber';
import getContract from './contracts';
import { Contract } from 'ethers';
import getNetworkDate from './date';
import { RAD, WAD } from './constants/UNITS';

const getSurplusAuctionLastIndex = async (contract: Contract): Promise<number> => {
    const auctionsQuantityBinary = await contract.kicks();
    return new BigNumber(auctionsQuantityBinary._hex).toNumber();
};

const getAuctionState = async (network: string, earliestEndDate: Date, greatestBid: number) => {
    const isBidExpired = (await getNetworkDate(network)) > earliestEndDate;
    const haveBids = greatestBid === 0;
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
    const baseAuctionInfo: SurplusAuctionBase = {
        network,
        id: auctionIndex,
    };

    if (isAuctionCollected) {
        const auctionLastIndex = await getSurplusAuctionLastIndex(contract);
        if (auctionLastIndex < auctionIndex) {
            throw new Error('No active auction exists with this id');
        }
        return { ...baseAuctionInfo, state: 'collected' };
    }

    const auctionEndDate = new Date(auctionData.end * 1000);
    const bidEndDate = new Date(auctionData.tic * 1000);
    const earliestEndDate = getEarliestDate(auctionEndDate, bidEndDate);
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

import type { SurplusAuction, SurplusAuctionUnexistant, SurplusAuctionBaseData } from './types';
import { getEarliestDate } from './helpers/getEarliestDate';
import BigNumber from './bignumber';
import getContract from './contracts';
import { Contract } from 'ethers';

const surplusAuctionLastIndex = async (contract: Contract) => {
    const auctionsQuantityBinary = await contract.kicks();
    return new BigNumber(auctionsQuantityBinary._hex);
};

const getAuctionState = (earliestEndDate: Date, greatestBid: number) => {
    const isBidExpired = new Date() > earliestEndDate;
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
    auctionIndex: number,
    contractOrNull: Contract | null = null
): Promise<SurplusAuction | SurplusAuctionUnexistant> {
    let contract: Contract;
    if (!!contractOrNull) {
        contract = contractOrNull;
    } else {
        contract = await getContract(network, 'MCD_FLAP');
    }

    const auctionData = await contract.bids(auctionIndex);
    const isAuctionDeleted = new BigNumber(auctionData.end).eq(0);
    const baseAuctionInfo: SurplusAuctionBaseData = {
        network,
        id: auctionIndex,
    };

    if (isAuctionDeleted) {
        const auctionLastIndex = await surplusAuctionLastIndex(contract);
        if (auctionLastIndex.lt(auctionIndex)) {
            throw new Error('No active auction found with this id');
        }
        return { ...baseAuctionInfo, state: 'collected' };
    }

    const auctionEndDate = new Date(auctionData.end * 1000);
    const bidEndDate = new Date(auctionData.tic * 1000);
    const earliestEndDate = getEarliestDate(auctionEndDate, bidEndDate);
    const state = getAuctionState(earliestEndDate, auctionData.tic);

    return {
        ...baseAuctionInfo,
        earliestEndDate,
        bidAmountMKR: new BigNumber(auctionData.bid._hex),
        receiveAmountDAI: new BigNumber(auctionData.lot._hex),
        receiverAddress: auctionData.guy,
        auctionEndDate,
        bidEndDate,
        state,
    };
};

const getActiveSurplusAuctionOrNull = async (
    network: string,
    auctionIndex: number,
    contractOrNull: Contract | null = null
) => {
    const auction = await fetchSurplusAuctionByIndex(network, auctionIndex, contractOrNull);
    if (auction.state === 'collected') {
        return null;
    }
    return auction;
};

export const fetchActiveSurplusAuctions = async function (network: string): Promise<SurplusAuction[]> {
    const contract = await getContract(network, 'MCD_FLAP');
    const auctionLastIndex = (await surplusAuctionLastIndex(contract)).toNumber();

    let auctionIndexToFetch = auctionLastIndex;
    let surplusAuctions: SurplusAuction[] = [];
    let currentSurplusAuction;
    while ((currentSurplusAuction = await getActiveSurplusAuctionOrNull(network, auctionIndexToFetch, contract))) {
        surplusAuctions.push(currentSurplusAuction);
        --auctionIndexToFetch;
    }
    return surplusAuctions;
};

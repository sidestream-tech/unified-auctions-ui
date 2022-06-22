import type { SurplusAuction, SurplusAuctionUnexistant, SurplusAuctionBaseData } from './types';
import { getEarliestDate } from './helpers/getEarliestDate';
import BigNumber from './bignumber';
import getContract from './contracts';
import { Contract } from 'ethers';
import getNetworkDate from './date';

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
    auctionIndex: number,
    contractOrNull?: Contract
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
        const auctionLastIndex = await getSurplusAuctionLastIndex(contract);
        if (auctionLastIndex < auctionIndex) {
            throw new Error('No active auction exists this id');
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
        bidAmountMKR: new BigNumber(auctionData.bid._hex),
        receiveAmountDAI: new BigNumber(auctionData.lot._hex),
        receiverAddress: auctionData.guy,
        auctionEndDate,
        bidEndDate,
        state,
    };
};

const getActiveSurplusAuctionOrNull = async (network: string, auctionIndex: number, contract?: Contract) => {
    const auction = await fetchSurplusAuctionByIndex(network, auctionIndex, contract);
    if (auction.state === 'collected') {
        return;
    }
    return auction;
};

export const fetchActiveSurplusAuctions = async function (network: string): Promise<SurplusAuction[]> {
    const contract = await getContract(network, 'MCD_FLAP');
    const auctionLastIndex = await getSurplusAuctionLastIndex(contract);

    const auctionIndexToFetch = auctionLastIndex;
    const surplusAuctions: SurplusAuction[] = [];
    let currentSurplusAuction;
    for (let i = auctionLastIndex; i > 0; i--) {
        currentSurplusAuction = await getActiveSurplusAuctionOrNull(network, auctionIndexToFetch, contract);
        if (!currentSurplusAuction) {
            break;
        }
        surplusAuctions.push(currentSurplusAuction);
    }
    return surplusAuctions;
};

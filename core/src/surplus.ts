import type { SurplusAuction, SurplusAuctionStates, SurplusAuctionUnexistant, SurplusAuctionBaseData } from './types';
import { getEarliestDate } from './helpers/getEarliestDate';
import BigNumber from './bignumber';
import getContract from './contracts';
import { Contract } from 'ethers';

const surplusAuctionLastIndex = async (contract: Contract) => {
    const auctionsQuantityBinary = await contract.kicks();
    return new BigNumber(auctionsQuantityBinary._hex);
}

export const fetchSurplusAuctionByIndex = async function (
    network: string,
    auctionIndex: number
): Promise<SurplusAuction | SurplusAuctionUnexistant> {
    const contract = await getContract(network, 'MCD_FLAP');
    const auctionData = await contract.bids(auctionIndex);
    const isAuctionDeleted = new BigNumber(auctionData.end).eq(0);
    const baseAuctionInfo: SurplusAuctionBaseData = {
        network,
        id: auctionIndex,
    };

    if (isAuctionDeleted) {
        const auctionLastIndex = await surplusAuctionLastIndex(contract)
        if (auctionLastIndex.lt(auctionIndex)) {
            throw new Error('No active auction found with this id');
        }
        return { ...baseAuctionInfo, state: 'collected'};
    }

    const auctionEndDate = new Date(auctionData.end * 1000);
    const bidEndDate = new Date(auctionData.tic * 1000);
    const earliestEndDate = getEarliestDate(auctionEndDate, bidEndDate);

    const isBidExpired = new Date() > earliestEndDate;

    const haveBids = auctionData.tic === 0;
    const [stateIfExpired, stateIfNotExpired] = haveBids
        ? ['ready-for-collection', 'have-bids']
        : ['requires-restart', 'just-started'];
    const state: SurplusAuctionStates = (isBidExpired ? stateIfExpired : stateIfNotExpired) as SurplusAuctionStates;

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

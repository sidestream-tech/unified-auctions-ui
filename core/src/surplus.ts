import type { SurplusAuctionData, SurplusAuctionStates } from './types';
import { getEarliestDate } from './helpers/getEarliestDate';
import BigNumber from './bignumber';
import getContract from './contracts';

export const fetchSurplusAuctionByIndex = async function (
    network: string,
    auctionIndex: number
): Promise<SurplusAuctionData> {
    const contract = await getContract(network, 'MCD_FLAP');

    const auctionsQuantityBinary = await contract.kicks();
    const auctionsQuantity = new BigNumber(auctionsQuantityBinary._hex);
    if (auctionsQuantity.lt(auctionIndex)) {
        throw new Error('No active auction found with this id');
    }

    const auctionData = await contract.bids(auctionIndex);
    const isAuctionDeleted = new BigNumber(auctionData.lot).eq(0);
    const baseAuctionInfo: SurplusAuctionData = {
        network,
        id: auctionIndex,
        state: 'collected',
    };

    if (isAuctionDeleted) {
        return baseAuctionInfo;
    }

    const expirationTimeAuction = new Date(auctionData.end * 1000);
    const expirationTimeBid = new Date(auctionData.tic * 1000);
    const earliestEndDate = getEarliestDate(expirationTimeAuction, expirationTimeBid);

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
        auctionEndDate: expirationTimeAuction,
        bidEndDate: expirationTimeBid,
        state,
    };
};

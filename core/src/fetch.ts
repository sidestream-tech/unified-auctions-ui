import type { AuctionInitialInfo, AuctionStatus } from './types';
import memoizee from 'memoizee';
import BigNumber from './bignumber';
import getContract, { getClipperNameByCollateralType } from './contracts';
import { RAD, RAY, WAD } from './constants/UNITS';
import { getCollateralConfigByType } from './constants/COLLATERALS';
import convertNumberTo32Bytes from './helpers/convertNumberTo32Bytes';

const AUCTION_DURATION_CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000;

const _fetchMaximumAuctionDurationInSeconds = async function (
    network: string,
    collateralType: string
): Promise<number> {
    const contract = await getContract(network, getClipperNameByCollateralType(collateralType));
    const tail = await contract.tail();
    return tail.toNumber();
};

const fetchMaximumAuctionDurationInSeconds = memoizee(_fetchMaximumAuctionDurationInSeconds, {
    maxAge: AUCTION_DURATION_CACHE_EXPIRY_MS,
    promise: true,
    length: 2,
});

export const fetchAuctionStatus = async function (
    network: string,
    collateralType: string,
    auctionId: number
): Promise<AuctionStatus> {
    const contract = await getContract(network, getClipperNameByCollateralType(collateralType));
    const statusData = await contract.getStatus(convertNumberTo32Bytes(auctionId));
    const unitPrice = new BigNumber(statusData.price._hex).div(RAY);
    const collateralAmount = new BigNumber(statusData.lot._hex).div(WAD);
    const debtDAI = new BigNumber(statusData.tab._hex).div(RAD);
    return {
        isActive: !statusData.needsRedo,
        collateralAmount,
        debtDAI,
        unitPrice,
        totalPrice: collateralAmount.multipliedBy(unitPrice),
    };
};

const fetchAuctionByCollateralTypeAndAuctionId = async function (
    network: string,
    collateralType: string,
    auctionId: number
): Promise<AuctionInitialInfo> {
    const maximumAuctionDurationInSeconds = await fetchMaximumAuctionDurationInSeconds(network, collateralType);
    const contract = await getContract(network, getClipperNameByCollateralType(collateralType));
    const auctionData = await contract.sales(auctionId);
    const startTimestamp = new BigNumber(auctionData.tic._hex).times(1000).toNumber();
    const endDate = new Date(startTimestamp + maximumAuctionDurationInSeconds * 1000);
    const isActive = endDate > new Date();
    return {
        network,
        id: `${collateralType}:${auctionId}`,
        auctionId,
        collateralType,
        collateralSymbol: getCollateralConfigByType(collateralType).symbol,
        collateralAmount: new BigNumber(auctionData.lot._hex).div(WAD),
        initialPrice: new BigNumber(auctionData.top._hex).div(RAY),
        vaultAddress: auctionData.usr,
        debtDAI: new BigNumber(auctionData.tab._hex).div(RAD),
        startDate: new Date(startTimestamp),
        endDate,
        isActive,
        isFinished: false,
        isRestarting: false,
    };
};

const fetchAuctionsByCollateralType = async function (network: string, collateralType: string) {
    const contract = await getContract(network, getClipperNameByCollateralType(collateralType));
    const activeAuctionIds = await contract.list();
    const activeAuctionPromises = activeAuctionIds.map((auctionId: BigNumber) => {
        return fetchAuctionByCollateralTypeAndAuctionId(network, collateralType, auctionId.toNumber());
    });
    return await Promise.all(activeAuctionPromises);
};

export default fetchAuctionsByCollateralType;

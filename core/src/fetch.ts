import type { AuctionInitialInfo, AuctionStatus } from './types';
import memoizee from 'memoizee';
import BigNumber from './bignumber';
import getContract, { getClipperNameByCollateralType } from './contracts';
import { RAD, RAD_NUMBER_OF_DIGITS, RAY, WAD } from './constants/UNITS';
import { getCollateralConfigByType } from './constants/COLLATERALS';
import convertNumberTo32Bytes from './helpers/convertNumberTo32Bytes';

const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000;

const _fetchMaximumAuctionDurationInSeconds = async function (
    network: string,
    collateralType: string
): Promise<number> {
    const contract = await getContract(network, getClipperNameByCollateralType(collateralType));
    const tail = await contract.tail();
    return tail.toNumber();
};

export const fetchMaximumAuctionDurationInSeconds = memoizee(_fetchMaximumAuctionDurationInSeconds, {
    maxAge: CACHE_EXPIRY_MS,
    promise: true,
    length: 2,
});

const _fetchMinimumBidDai = async function (network: string, collateralType: string): Promise<BigNumber> {
    const contractName = getClipperNameByCollateralType(collateralType);
    const contract = await getContract(network, contractName);
    const minimumBidRaw = await contract.chost();
    return new BigNumber(minimumBidRaw._hex).shiftedBy(-RAD_NUMBER_OF_DIGITS);
};

export const fetchMinimumBidDai = memoizee(_fetchMinimumBidDai, {
    maxAge: CACHE_EXPIRY_MS,
    promise: true,
    length: 2,
});

export const fetchAuctionStatus = async function (
    network: string,
    collateralType: string,
    auctionIndex: number
): Promise<AuctionStatus> {
    const clipper = await getContract(network, getClipperNameByCollateralType(collateralType));
    const statusData = await clipper.getStatus(convertNumberTo32Bytes(auctionIndex));
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

export const fetchAuctionByCollateralTypeAndAuctionIndex = async function (
    network: string,
    collateralType: string,
    auctionIndex: number
): Promise<AuctionInitialInfo> {
    const maximumAuctionDurationInSeconds = await fetchMaximumAuctionDurationInSeconds(network, collateralType);
    const contract = await getContract(network, getClipperNameByCollateralType(collateralType));
    const auctionData = await contract.sales(auctionIndex);
    const startUnixTimestamp = new BigNumber(auctionData.tic._hex).toNumber();
    const collateralConfig = getCollateralConfigByType(collateralType);
    if (startUnixTimestamp === 0) {
        throw new Error('No active auction found with this id');
    }
    return {
        network,
        id: `${collateralType}:${auctionIndex}`,
        index: auctionIndex,
        collateralType,
        collateralSymbol: collateralConfig.symbol,
        tokenName: collateralConfig.tokenName,
        collateralAmount: new BigNumber(auctionData.lot._hex).div(WAD),
        initialPrice: new BigNumber(auctionData.top._hex).div(RAY),
        vaultAddress: auctionData.usr,
        debtDAI: new BigNumber(auctionData.tab._hex).div(RAD),
        startDate: new Date(startUnixTimestamp * 1000),
        endDate: new Date((startUnixTimestamp + maximumAuctionDurationInSeconds) * 1000),
        isActive: true,
        isFinished: false,
        isRestarting: false,
        fetchedAt: new Date(),
    };
};

const fetchAuctionsByCollateralType = async function (network: string, collateralType: string) {
    const contract = await getContract(network, getClipperNameByCollateralType(collateralType));
    const activeAuctionIndexes = await contract.list();
    const activeAuctionPromises = activeAuctionIndexes.map((auctionIndex: BigNumber) => {
        return fetchAuctionByCollateralTypeAndAuctionIndex(network, collateralType, auctionIndex.toNumber());
    });
    return await Promise.all(activeAuctionPromises);
};

export default fetchAuctionsByCollateralType;

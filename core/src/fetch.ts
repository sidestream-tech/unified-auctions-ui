import type { AuctionInitialInfo } from './types';
import getContract, { getClipperNameByCollateralType } from './contracts';
import { RAD, RAY, WAD } from './constants/UNITS';
import { getCollateralConfigByType } from './constants/COLLATERALS';
import BigNumber from './bignumber';

const fetchMaximumAuctionDurationInSeconds = async function (
    network: string,
    collateralType: string
): Promise<number> {
    const contract = await getContract(network, getClipperNameByCollateralType(collateralType));
    const tail = await contract.tail();
    return tail.toNumber();
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

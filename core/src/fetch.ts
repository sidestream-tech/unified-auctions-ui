import getContract, { getClipperNameByCollateralType } from './contracts';
import { RAD, RAY, WAD } from './constants/UNITS';
import BigNumber from './bignumber';

const fetchTail = async function (network: string, collateralType: string) {
    const contract = await getContract(network, getClipperNameByCollateralType(collateralType));
    const tail = await contract.tail();
    return tail.toNumber();
};

const fetchCusp = async function (network: string, collateralType: string) {
    const contract = await getContract(network, getClipperNameByCollateralType(collateralType));
    const cusp = await contract.cusp();
    return new BigNumber(cusp._hex).div(RAY);
};

const fetchChost = async function (network: string, collateralType: string) {
    const contract = await getContract(network, getClipperNameByCollateralType(collateralType));
    const chost = await contract.chost();
    return new BigNumber(chost._hex).div(RAD);
};

const fetchAuctionByAuctionId = async function (network: string, collateralType: string, auctionId: number) {
    const [tail, cusp, chost] = await Promise.all([
        fetchTail(network, collateralType),
        fetchCusp(network, collateralType),
        fetchChost(network, collateralType),
    ]);
    const contract = await getContract(network, getClipperNameByCollateralType(collateralType));
    const auctionData = contract.sales(auctionId);
    const tic = new Date(new BigNumber(auctionData.tic._hex).times(1000).toNumber());
    const obj = {
        created: tic,
        tab: new BigNumber(auctionData.tab._hex).div(RAD),
        lot: new BigNumber(auctionData.lot._hex).div(WAD),
        top: new BigNumber(auctionData.top._hex).div(RAY),
        usr: auctionData.usr,
        saleId: auctionId,
        active: true,
        endDate: new Date(new BigNumber(auctionData.tic.toNumber() + tail).times(1000).toNumber()),
        chost: chost,
        cusp: cusp,
        collateralType: collateralType,
    };
    return obj;
};

const fetchAuctionsByCollateralType = async function (network: string, collateralType: string) {
    const contract = await getContract(network, getClipperNameByCollateralType(collateralType));
    const activeAuctionIds = await contract.list();
    const activeAuctionPromises = activeAuctionIds.map((auctionId: BigNumber) => {
        return fetchAuctionByAuctionId(network, collateralType, auctionId.toNumber());
    });
    return await Promise.all(activeAuctionPromises);
};

export default fetchAuctionsByCollateralType;

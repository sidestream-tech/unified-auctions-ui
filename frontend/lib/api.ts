import getMaker from '~/lib/maker';
import COLLATERALS from '~/lib/constants/COLLATERALS';

const fetchAuctionsByType = async function (type: string, network: string): Promise<Auction[]> {
    const maker = await getMaker(network);
    const protoAuctions = await maker.service('liquidation').getAllClips(type);
    return protoAuctions.map((protoAuction: any) => ({
        id: `${protoAuction.ilk}-${protoAuction.saleId}`,
        collateralType: COLLATERALS[protoAuction.ilk].title,
        vaultOwner: protoAuction.usr,
        amountRAW: protoAuction.lot,
        amountDAI: protoAuction.tab,
        amountPerCollateral: protoAuction.tab / protoAuction.lot,
        till: protoAuction.endDate,
        marketValue: 0,
        // from: protoAuction.tic,
        // isActive: protoAuction.active,
        // amountDAIminimum: protoAuction.chost,
    }));
};

export const fetchAllAuctions = async function (network: string): Promise<Auction[]> {
    const collateralNames = Object.keys(COLLATERALS);
    const promises = collateralNames.map((collateralName: string) => fetchAuctionsByType(collateralName, network));
    const auctionGroups = await Promise.all(promises);
    return auctionGroups.flat();
};

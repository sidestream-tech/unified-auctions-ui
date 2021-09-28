import getMaker from '~/lib/maker';
import COLLATERALS from '~/lib/constants/COLLATERALS';

const fetchAuctionsByType = async function (type: string, network: string): Promise<Auction[]> {
    const maker = await getMaker(network);
    const protoAuctions = await maker.service('liquidation').getAllClips(type);
    const now = new Date();
    return protoAuctions.map((protoAuction: any) => {
        const isActive = protoAuction.active && protoAuction.endDate > now;
        return {
            id: `${protoAuction.ilk}-${protoAuction.saleId}`,
            collateralType: COLLATERALS[protoAuction.ilk].title,
            vaultOwner: protoAuction.usr,
            amountRAW: protoAuction.lot,
            amountDAI: protoAuction.tab,
            amountPerCollateral: protoAuction.tab / protoAuction.lot,
            till: protoAuction.endDate,
            isActive,
            marketValue: isActive ? 0 : undefined,
            // from: protoAuction.tic,
            // amountDAIminimum: protoAuction.chost,
        };
    });
};

export const fetchAllAuctions = async function (network: string): Promise<Auction[]> {
    const collateralNames = Object.keys(COLLATERALS);
    const promises = collateralNames.map((collateralName: string) => fetchAuctionsByType(collateralName, network));
    const auctionGroups = await Promise.all(promises);
    return auctionGroups.flat();
};

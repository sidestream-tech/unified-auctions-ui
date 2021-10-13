import BigNumber from 'bignumber.js';
import getMaker from '~/lib/maker';
import COLLATERALS from '~/lib/constants/COLLATERALS';

const fetchAuctionsByType = async function (type: string, maker: any): Promise<Auction[]> {
    const protoAuctions = await maker.service('liquidation').getAllClips(type);
    const now = new Date();
    return protoAuctions.map((protoAuction: any) => {
        const isActive = protoAuction.active && protoAuction.endDate > now;
        return {
            id: `${protoAuction.ilk}:${protoAuction.saleId}`,
            auctionId: protoAuction.saleId,
            collateralType: protoAuction.ilk,
            collateralSymbol: COLLATERALS[protoAuction.ilk].symbol,
            vaultOwner: protoAuction.usr,
            amountRAW: new BigNumber(protoAuction.lot),
            amountDAI: new BigNumber(protoAuction.tab),
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
    const maker = await getMaker(network);
    const collateralNames = Object.keys(COLLATERALS);
    const promises = collateralNames.map((collateralName: string) => fetchAuctionsByType(collateralName, maker));
    const auctionGroups = await Promise.all(promises);
    return auctionGroups.flat();
};

import BigNumber from 'bignumber.js';
import getMaker from '~/lib/maker';
import COLLATERALS from '~/lib/constants/COLLATERALS';
import { WAD, RAD, RAY } from '~/lib/constants/UNITS';

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
        };
    });
};

const enrichAuctionWithActualNumbers = async function (auction: Auction, network?: string): Promise<Auction> {
    const maker = await getMaker(network);
    if (!auction.isActive) {
        return auction;
    }
    const status = await maker.service('liquidation').getStatus(auction.collateralType, auction.auctionId);
    return {
        ...auction,
        isActive: !status.needsRedo,
        amountRAW: new BigNumber(status.lot).div(WAD),
        amountDAI: new BigNumber(status.tab).div(RAD),
        amountPerCollateral: new BigNumber(status.price).div(RAY),
    };
};

export const fetchAllAuctions = async function (network: string): Promise<Auction[]> {
    const maker = await getMaker(network);
    const collateralNames = Object.keys(COLLATERALS);

    // get all auctions
    const auctionGroupsPromises = collateralNames.map((collateralName: string) =>
        fetchAuctionsByType(collateralName, maker)
    );
    const auctionGroups = await Promise.all(auctionGroupsPromises);
    const auctions = auctionGroups.flat();

    // enrich them with statuses
    const enrichedAuctionsPromises = auctions.map((auction: Auction) =>
        enrichAuctionWithActualNumbers(auction, network)
    );
    const enrichedAuctions = await Promise.all(enrichedAuctionsPromises);

    return enrichedAuctions;
};

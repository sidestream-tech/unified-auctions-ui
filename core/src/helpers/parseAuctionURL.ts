import { getCollateralConfigByType } from '../constants/COLLATERALS';

function parseAuctionURL(url: string): { collateralType: string; auctionId: number } {
    const parts = url.split(':', 1);
    const collateralType = parts[0];
    const auctionId = parts[1];

    // Check that AuctionId is a number
    if (!/\D/.test(auctionId)) {
        throw new Error(`"${auctionId}" is not a valid Auction ID.`);
    }

    // Check if we support the CollateralType
    getCollateralConfigByType(collateralType);

    return {
        collateralType,
        auctionId: parseInt(auctionId),
    };
}

export default parseAuctionURL;

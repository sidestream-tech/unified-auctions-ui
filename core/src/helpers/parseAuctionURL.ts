import { getCollateralConfigByType } from '../constants/COLLATERALS';

function parseAuctionURL(url: string): { collateralType: string; auctionId: number } {
    const parts = url.split(':');
    const collateralType = parts[0];
    const auctionId = parts[1];

    // Check if we support the CollateralType
    getCollateralConfigByType(collateralType);

    // Check if auction id is a valid auction id
    if (Number.isNaN(parseInt(auctionId))) {
        throw new Error(`"${auctionId}" is not a valid AuctionID!`);
    }

    return {
        collateralType,
        auctionId: parseInt(auctionId),
    };
}

export default parseAuctionURL;

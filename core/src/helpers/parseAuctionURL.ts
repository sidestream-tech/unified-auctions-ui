import { getCollateralConfigByType } from '../constants/COLLATERALS';

function parseAuctionURL(url: string): { collateralType: string; auctionId: number } {
    const parts = url.split(':');
    const collateralType = parts[0];
    const auctionId = parts[1];

    // Check if we support the CollateralType
    getCollateralConfigByType(collateralType);

    return {
        collateralType,
        auctionId: parseInt(auctionId),
    };
}

export default parseAuctionURL;

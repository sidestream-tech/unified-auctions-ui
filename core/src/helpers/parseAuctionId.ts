import { getCollateralConfigByType } from '../constants/COLLATERALS';

function parseAuctionId(id: string): { collateralType: string; index: number } {
    const parts = id.split(':');
    const collateralType = parts[0];
    const index = parts[1];

    // Check if we support the CollateralType
    getCollateralConfigByType(collateralType);

    // Check if auction id is a valid auction id
    if (Number.isNaN(parseInt(index))) {
        throw new Error(`"${index}" is not a valid auction id`);
    }

    return {
        collateralType,
        index: parseInt(index),
    };
}

export default parseAuctionId;

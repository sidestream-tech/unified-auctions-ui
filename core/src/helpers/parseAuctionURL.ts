import convertNumberTo32Bytes from './convertNumberTo32Bytes';

export function parseAuctionURL(url: string): { collateralType: string; auctionID: string } {
    const parts = url.split(':', 1);
    const collateralType = parts[0];
    const auctionID = convertNumberTo32Bytes(parts[1]);

    return {
        collateralType,
        auctionID,
    };
}

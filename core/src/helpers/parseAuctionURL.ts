function parseAuctionURL(url: string): { collateralType: string; auctionId: number } {
    const parts = url.split(':', 1);
    const collateralType = parts[0];
    const auctionId = parts[1];

    return {
        collateralType,
        auctionId,
    };
}

export default parseAuctionURL;

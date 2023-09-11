import { SUPPORTED_AUCTION_TYPES } from './variables';

const ALL_SUPPORTED_AUCTION_TYPES = ['COLLATERAL', 'DEBT'] as const;

export const getSupportedAuctionTypes = function () {
    if (!SUPPORTED_AUCTION_TYPES) {
        return ALL_SUPPORTED_AUCTION_TYPES;
    }
    return SUPPORTED_AUCTION_TYPES.split(',').map(item => item.trim().toUpperCase());
};

export const setupSupportedAuctionTypes = function () {
    if (!SUPPORTED_AUCTION_TYPES) {
        console.warn(`no SUPPORTED_AUCTION_TYPES env variable provided, activating all auction types`);
    } else {
        const supportedAuctionTypes = getSupportedAuctionTypes();
        for (const auctionType of supportedAuctionTypes) {
            if (!ALL_SUPPORTED_AUCTION_TYPES.includes(auctionType as typeof ALL_SUPPORTED_AUCTION_TYPES[number])) {
                throw new Error(`SUPPORTED_AUCTION_TYPES env variable contains invalid auction type "${auctionType}"`);
            }
        }
        console.info(
            `SUPPORTED_AUCTION_TYPES env variable provided: activating only "${supportedAuctionTypes.join(', ')}"`
        );
    }
};

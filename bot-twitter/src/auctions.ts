import type { AuctionInitialInfo } from 'auctions-core/src/types';
import { fetchAllInitialAuctions } from 'auctions-core/src/auctions';

const THRESHOLD_FOR_NEW_AUCTIONS = 5 * 60 * 1000;
const knownAuctionIds = new Set();

const checkIfAuctionIsAlreadyKnown = function (auction: AuctionInitialInfo): boolean {
    return !knownAuctionIds.has(auction.id);
};

const markAuctionAsKnown = function (auction: AuctionInitialInfo): void {
    knownAuctionIds.add(auction.id);
};

export const getNewAuctions = async function (network: string): Promise<AuctionInitialInfo[]> {
    const auctions = await fetchAllInitialAuctions(network);
    console.info(`auctions: found "${auctions.length}" on "${network}" network`);

    const activeActions = auctions.filter(auction => auction.isActive);
    console.info(`auctions: "${activeActions.length}" of "${auctions.length}" are active`);

    const newAuctions = activeActions.filter(activeAction => {
        const isNew = activeAction.startDate > new Date(Date.now() - THRESHOLD_FOR_NEW_AUCTIONS);
        return isNew && checkIfAuctionIsAlreadyKnown(activeAction);
    });
    console.info(`auctions: "${newAuctions.length}" of "${activeActions.length}" are new`);

    newAuctions.map(markAuctionAsKnown);
    return newAuctions;
};

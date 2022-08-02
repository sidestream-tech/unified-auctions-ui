import type { SurplusAuction } from 'auctions-core/src/types';
import { fetchActiveSurplusAuctions } from 'auctions-core/src/surplus';

const THRESHOLD_FOR_NEW_AUCTIONS = 5 * 60 * 1000;
const knownAuctionIds = new Set();

const checkIfAuctionIsAlreadyKnown = function (auction: SurplusAuction): boolean {
    return !knownAuctionIds.has(auction.id);
};

const markAuctionAsKnown = function (auction: SurplusAuction): void {
    knownAuctionIds.add(auction.id);
};

export const getNewSurplusAuctionsFromActiveSurplusAuctions = function (
    activeActions: SurplusAuction[]
): SurplusAuction[] {
    const newAuctions = activeActions.filter(activeAction => {
        const isNew = activeAction.fetchedAt > new Date(Date.now() - THRESHOLD_FOR_NEW_AUCTIONS);
        return isNew && checkIfAuctionIsAlreadyKnown(activeAction);
    });
    console.info(`surplus auctions: "${newAuctions.length}" of "${activeActions.length}" auctions are new`);

    newAuctions.map(markAuctionAsKnown);
    return newAuctions;
};

export const getAllSurplusAuctions = async function (network: string): Promise<SurplusAuction[]> {
    const auctions = await fetchActiveSurplusAuctions(network);
    const auctionIds = auctions.map(auction => `"${auction.id}"`).join(', ');

    console.info(`surplus auctions: found "${auctions.length}" auctions ${auctionIds} on "${network}" network`);

    return auctions;
};

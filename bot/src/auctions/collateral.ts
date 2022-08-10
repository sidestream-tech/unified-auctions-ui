import type { AuctionInitialInfo } from 'auctions-core/src/types';
import { fetchAllInitialAuctions } from 'auctions-core/src/auctions';
import { getWhitelistedCollaterals } from '../whitelist';
import { notifyCollateral } from '../notify';
import participate from '../keeper';

const THRESHOLD_FOR_NEW_AUCTIONS = 5 * 60 * 1000;
const knownAuctionIds = new Set();

const checkIfAuctionIsAlreadyKnown = function (auction: AuctionInitialInfo): boolean {
    return !knownAuctionIds.has(auction.id);
};

const markAuctionAsKnown = function (auction: AuctionInitialInfo): void {
    knownAuctionIds.add(auction.id);
};

export const getNewAuctionsFromActiveAuctions = function (activeActions: AuctionInitialInfo[]): AuctionInitialInfo[] {
    const newAuctions = activeActions.filter(activeAction => {
        const isNew = activeAction.startDate > new Date(Date.now() - THRESHOLD_FOR_NEW_AUCTIONS);
        return isNew && checkIfAuctionIsAlreadyKnown(activeAction);
    });
    console.info(`auctions: "${newAuctions.length}" of "${activeActions.length}" auctions are new`);

    newAuctions.map(markAuctionAsKnown);
    return newAuctions;
};

export const getAllAuctions = async function (network: string): Promise<AuctionInitialInfo[]> {
    const collaterals = await getWhitelistedCollaterals(network);
    const auctions = await fetchAllInitialAuctions(network, collaterals);

    const auctionIds = auctions.map(auction => `"${auction.id}"`).join(', ');
    console.info(`auctions: found "${auctions.length}" auctions (${auctionIds}) on "${network}" network`);
    return auctions;
};

export const loopCollateral = async function (network: string): Promise<void> {
    try {
        const activeAuctions = await getAllAuctions(network);
        if (activeAuctions.length === 0) {
            return;
        }
        const newAuctions = getNewAuctionsFromActiveAuctions(activeAuctions);
        newAuctions.map(notifyCollateral);
        participate(network, activeAuctions);
    } catch (error) {
        console.error('loop error:', error);
    }
};

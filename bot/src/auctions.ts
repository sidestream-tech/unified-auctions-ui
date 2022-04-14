import type { AuctionInitialInfo } from 'auctions-core/src/types';
import { fetchAllInitialAuctions } from 'auctions-core/src/auctions';
import { COLLATERAL_WHITELIST } from './variables';
import { parseCollateralWhitelist } from './whitelist';

const THRESHOLD_FOR_NEW_AUCTIONS = 5 * 60 * 1000;
const knownAuctionIds = new Set();

const checkIfAuctionIsAlreadyKnown = function (auction: AuctionInitialInfo): boolean {
    return !knownAuctionIds.has(auction.id);
};

const markAuctionAsKnown = function (auction: AuctionInitialInfo): void {
    knownAuctionIds.add(auction.id);
};

const checkIfAuctionCollateralIsInWhitelist = function (
    auction: AuctionInitialInfo,
    whitelist: string[] | undefined
): boolean {
    // if whitelist is disabled all auctions should be used
    if (!whitelist) {
        return true;
    }
    return whitelist.includes(auction.collateralType);
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
    let collateralWhitelist: undefined | string[];
    if (COLLATERAL_WHITELIST) {
        collateralWhitelist = parseCollateralWhitelist(COLLATERAL_WHITELIST);
        console.info(`auctions: whitelist is enabled, only fetching auctions from "${COLLATERAL_WHITELIST}"`);
    }

    const auctions = await fetchAllInitialAuctions(network);
    const auctionIds = auctions.map(auction => `"${auction.id}"`).join(', ');
    console.info(`auctions: found "${auctions.length}" auctions (${auctionIds}) on "${network}" network`);
    return auctions.filter(auction => checkIfAuctionCollateralIsInWhitelist(auction, collateralWhitelist));
};

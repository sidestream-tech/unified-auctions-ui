import type { DebtAuctionActive } from 'auctions-core/src/types';
import { fetchActiveDebtAuctions } from 'auctions-core/src/debt';
import { THRESHOLD_FOR_NEW_AUCTIONS } from '../variables';
import { notifyDebt } from '../notify';
import { participate } from '../keepers/debt';

const knownAuctionIds = new Set();

const checkIfAuctionIsAlreadyKnown = function (auction: DebtAuctionActive): boolean {
    return !knownAuctionIds.has(auction.id);
};

const markAuctionAsKnown = function (auction: DebtAuctionActive): void {
    knownAuctionIds.add(auction.id);
};

export const getNewDebtAuctionsFromActiveDebtAuctions = function (
    activeActions: DebtAuctionActive[]
): DebtAuctionActive[] {
    const newAuctions = activeActions.filter(activeAction => {
        const isNew = activeAction.auctionStartDate > new Date(Date.now() - THRESHOLD_FOR_NEW_AUCTIONS);
        return isNew && checkIfAuctionIsAlreadyKnown(activeAction);
    });
    console.info(`debt auctions: "${newAuctions.length}" of "${activeActions.length}" auctions are new`);

    newAuctions.map(markAuctionAsKnown);
    return newAuctions;
};

export const getAllActiveDebtAuctions = async function (network: string): Promise<DebtAuctionActive[]> {
    const auctions = await fetchActiveDebtAuctions(network);
    const auctionIds = auctions.map(auction => auction.id).join(', ');
    console.info(`debt auctions: found "${auctions.length}" auctions "${auctionIds}" on "${network}" network`);
    return auctions;
};

export const loopDebt = async function (network: string): Promise<void> {
    try {
        const activeAuctions = await getAllActiveDebtAuctions(network);
        if (activeAuctions.length === 0) {
            return;
        }
        getNewDebtAuctionsFromActiveDebtAuctions(activeAuctions).map(notifyDebt);
        participate(network, activeAuctions);
    } catch (error) {
        console.error('debt loop error', error);
    }
};

import type { AuctionTransaction, TakeEvent } from 'auctions-core/src/types';
import { ActionContext } from 'vuex';
import { fetchActiveSurplusAuctions } from 'auctions-core/src/surplus';

interface State {
    auctionStorage: Record<string, AuctionTransaction>;
    takeEventStorage: Record<string, TakeEvent[]>;
    areAuctionsFetching: boolean;
    isSelectedAuctionFetching: boolean;
    areTakeEventsFetching: boolean;
    isBidding: boolean;
    error: string | null;
    auctionErrors: Record<string, string | undefined>;
    restartingAuctionsIds: string[];
    lastUpdated: Date | undefined;
}

const getInitialState = (): State => ({
    auctionStorage: {},
    takeEventStorage: {},
    areAuctionsFetching: false,
    isSelectedAuctionFetching: false,
    areTakeEventsFetching: false,
    isBidding: false,
    error: null,
    auctionErrors: {},
    restartingAuctionsIds: [],
    lastUpdated: undefined,
});

export const state = (): State => getInitialState();
export const actions = {
    async fetchSurplusAuctions({ rootGetters }: ActionContext<State, State>) {
        const network = rootGetters['network/getMakerNetwork'];
        const auctions = await fetchActiveSurplusAuctions(network);
        return auctions;
    },
};

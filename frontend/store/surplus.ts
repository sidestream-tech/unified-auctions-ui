import type { SurplusAuctionFullData } from 'auctions-core/src/types';
import { ActionContext } from 'vuex';
import { fetchActiveSurplusAuctions } from 'auctions-core/src/surplus';

interface State {
    auctionStorage: Record<string, SurplusAuctionFullData>;
}

const getInitialState = (): State => ({
    auctionStorage: {},
});

export const state = (): State => getInitialState();

export const getters = {
    auctionStorage(state: State) {
        return state.auctionStorage;
    }
}

export const mutations = {
    addAuctionToStorage(state: State, auction: SurplusAuctionFullData) {
        state.auctionStorage[auction.id] = auction
    }
}

export const actions = {
    async fetchSurplusAuctions({ rootGetters, commit }: ActionContext<State, State>) {
        const network = rootGetters['network/getMakerNetwork'];
        const auctions = await fetchActiveSurplusAuctions(network);
        auctions.forEach(
            auction => commit('surplus/addAuctionToStorage', auction)
        )
        return auctions;
    },
};

import Vue from 'vue';
import type { SurplusAuction } from 'auctions-core/src/types';
import { ActionContext } from 'vuex';
import { fetchActiveSurplusAuctions } from 'auctions-core/src/surplus';

interface State {
    auctionStorage: Record<string, SurplusAuction>;
}

const getInitialState = (): State => ({
    auctionStorage: {},
});

export const state = (): State => getInitialState();

export const getters = {
    auctionStorage(state: State) {
        return state.auctionStorage;
    },
};

export const mutations = {
    addAuctionToStorage(state: State, auction: SurplusAuction) {
        Vue.set(state.auctionStorage, auction.id, auction);
    },
};

export const actions = {
    async fetchSurplusAuctions({ rootGetters, commit }: ActionContext<State, State>) {
        const network = rootGetters['network/getMakerNetwork'];
        if (!network) {
            return;
        }
        const auctions = await fetchActiveSurplusAuctions(network);
        auctions.forEach(auction => commit('addAuctionToStorage', auction));
        return auctions;
    },
};

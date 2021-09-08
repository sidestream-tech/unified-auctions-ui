import { ActionContext } from 'vuex';
import { fetchAllAuctions } from '~/lib/api';

interface State {
    auctions: Auction[];
    isLoading: boolean;
    error: string | null;
}

export const state = (): State => ({
    auctions: [],
    isLoading: false,
    error: null,
});

export const getters = {
    list(state: State) {
        return state.auctions;
    },
    getIsLoading(state: State) {
        return state.isLoading;
    },
    getError(state: State) {
        return state.error;
    },
};

export const mutations = {
    setAuctions(state: State, auctions: Auction[]) {
        state.auctions = auctions;
    },
    setLoading(state: State, isLoading: boolean) {
        state.isLoading = isLoading;
    },
    setError(state: State, error: string) {
        state.error = error;
    },
};

export const actions = {
    async fetch({ commit, rootGetters }: ActionContext<State, State>) {
        const network = rootGetters['preferences/getNetwork'];
        if (!network) {
            return;
        }
        commit('setLoading', true);
        try {
            const auctions = await fetchAllAuctions(network);
            commit('setError', null);
            commit('setAuctions', auctions);
        } catch (error) {
            console.error('fetch auction error', error);
            commit('setError', error.message);
        } finally {
            commit('setLoading', false);
        }
    },
    async refetch({ commit, dispatch }: ActionContext<State, State>) {
        commit('setAuctions', []);
        await dispatch('fetch');
    },
};

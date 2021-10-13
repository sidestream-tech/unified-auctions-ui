import { ActionContext } from 'vuex';
import { fetchAllAuctions } from '~/lib/auctions';

const REFETCH_INTERVAL = 30 * 1000;
let refetchIntervalId: ReturnType<typeof setInterval> | undefined;

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
    async fetchWithoutLoading({ commit, rootGetters }: ActionContext<State, State>) {
        const network = rootGetters['preferences/getNetwork'];
        if (!network) {
            return;
        }
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
    async fetch({ commit, dispatch }: ActionContext<State, State>) {
        commit('setLoading', true);
        await dispatch('fetchWithoutLoading');
        if (refetchIntervalId) {
            clearInterval(refetchIntervalId);
        }
        refetchIntervalId = setInterval(() => dispatch('fetchWithoutLoading'), REFETCH_INTERVAL);
    },
};

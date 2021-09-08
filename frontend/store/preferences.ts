import { ActionContext } from 'vuex';

interface State {
    network: string | null;
    isExplanationsShown: boolean;
}

export const state = (): State => ({
    network: null,
    isExplanationsShown: true,
});

export const getters = {
    getNetwork(state: State) {
        return state.network;
    },
    getIsExplanationsShown(state: State) {
        return state.isExplanationsShown;
    },
};

export const mutations = {
    setNetwork(state: State, network: string | null): void {
        state.network = network;
    },
    setExplanations(state: State, isExplanationsShown: boolean): void {
        state.isExplanationsShown = isExplanationsShown;
    },
};

export const actions = {
    setNetwork({ commit, dispatch }: ActionContext<State, State>, network: string | null): void {
        commit('setNetwork', network);
        dispatch('auctions/refetch', null, { root: true });
    },
    setExplanationsAction({ commit }: ActionContext<State, State>, isExplanationsShown: boolean): void {
        commit('setExplanations', isExplanationsShown);
    },
};

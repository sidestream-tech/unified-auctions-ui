import Vue from 'vue';
import { ActionContext } from 'vuex';

const appVersion = process.env.APPLICATION_VERSION ?? 'default';

interface State {
    isExplanationsShown: boolean;
    isDarkMode: boolean | undefined;
    rpcUrlRecords: Record<string, string | undefined>;
}

export const state = (): State => ({
    isExplanationsShown: false,
    isDarkMode: undefined,
    rpcUrlRecords: {},
});

export const getters = {
    getIsExplanationsShown(state: State) {
        return state.isExplanationsShown;
    },
    getIsDarkMode(state: State) {
        if (state.isDarkMode === undefined) {
            if (!window?.matchMedia) {
                return false;
            }
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        return state.isDarkMode;
    },
    getRpcUrl(state: State) {
        return state.rpcUrlRecords[appVersion];
    },
};

export const mutations = {
    setExplanations(state: State, isExplanationsShown: boolean): void {
        state.isExplanationsShown = isExplanationsShown;
    },
    setIsDarkMode(state: State, isDarkMode: boolean): void {
        state.isDarkMode = isDarkMode;
    },
    setRpcUrl(state: State, rpcUrl: string | undefined): void {
        Vue.set(state.rpcUrlRecords, appVersion, rpcUrl);
    },
};

export const actions = {
    setExplanationsAction({ commit }: ActionContext<State, State>, isExplanationsShown: boolean): void {
        commit('setExplanations', isExplanationsShown);
    },
    setIsDarkMode({ commit }: ActionContext<State, State>, isDarkMode: boolean): void {
        commit('setIsDarkMode', isDarkMode);
    },
    setRpcUrl({ commit }: ActionContext<State, State>, rpcUrl: string | undefined): void {
        commit('setRpcUrl', rpcUrl);
    },
};

import { ActionContext } from 'vuex';

interface State {
    isExplanationsShown: boolean;
    isDarkMode: boolean | undefined;
}

export const state = (): State => ({
    isExplanationsShown: true,
    isDarkMode: undefined,
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
};

export const mutations = {
    setExplanations(state: State, isExplanationsShown: boolean): void {
        state.isExplanationsShown = isExplanationsShown;
    },
    setIsDarkMode(state: State, isDarkMode: boolean): void {
        state.isDarkMode = isDarkMode;
    },
};

export const actions = {
    setExplanationsAction({ commit }: ActionContext<State, State>, isExplanationsShown: boolean): void {
        commit('setExplanations', isExplanationsShown);
    },
    setIsDarkMode({ commit }: ActionContext<State, State>, isDarkMode: boolean): void {
        commit('setIsDarkMode', isDarkMode);
    },
};

import { ActionContext } from 'vuex';

interface State {
    isExplanationsShown: boolean;
    isDarkMode: boolean | undefined;
    acceptedTerms: boolean;
}

export const state = (): State => ({
    isExplanationsShown: true,
    isDarkMode: undefined,
    acceptedTerms: false,
});

export const getters = {
    getIsInvalidNetwork(_state: State, getters: any): boolean {
        return !!getters.getNetwork;
    },
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
    getAcceptedTerms(state: State): boolean {
        return state.acceptedTerms;
    },
};

export const mutations = {
    setExplanations(state: State, isExplanationsShown: boolean): void {
        state.isExplanationsShown = isExplanationsShown;
    },
    setIsDarkMode(state: State, isDarkMode: boolean): void {
        state.isDarkMode = isDarkMode;
    },
    setAcceptedTerms(state: State, accepted: boolean): void {
        state.acceptedTerms = accepted;
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

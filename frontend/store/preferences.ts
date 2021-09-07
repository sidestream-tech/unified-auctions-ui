import { ActionContext } from 'vuex';

interface State {
    isExplanationsShown: boolean;
}

export const state = (): State => ({
    isExplanationsShown: true,
});

export const getters = {
    getIsExplanationsShown: (state: State) => {
        return state.isExplanationsShown;
    },
};

export const mutations = {
    setExplanations(state: State, isExplanationsShown: boolean) {
        state.isExplanationsShown = isExplanationsShown;
    },
};

export const actions = {
    setExplanationsAction({ commit }: ActionContext<State, State>, isExplanationsShown: boolean): void {
        commit('setExplanations', isExplanationsShown);
    },
};

import { ActionContext } from 'vuex';
import Vue from 'vue';
import Cookies from 'js-cookie';

interface State {
    acceptedTerms: string | undefined;
}

export const state = (): State => ({
    acceptedTerms: Cookies.get('terms-and-conditions'),
});

export const getters = {
    hasAcceptedTerms(state: State): boolean {
        return state.acceptedTerms === 'accepted';
    },
};

export const mutations = {
    setAcceptedTerms(state: State, hasAccepted: string | undefined) {
        Vue.set(state, 'acceptedTerms', hasAccepted);
    },
};

export const actions = {
    acceptTerms({ commit }: ActionContext<State, State>) {
        Cookies.set('terms-and-conditions', 'accepted');
        commit('setAcceptedTerms', 'accepted');
    },
};

interface State {
    acceptedTerms: boolean;
}

export const state = (): State => ({
    acceptedTerms: false,
});

export const getters = {
    hasAcceptedTerms(state: State): boolean {
        return state.acceptedTerms;
    },
};

export const mutations = {
    acceptTerms(state: State) {
        state.acceptedTerms = true;
    },
};

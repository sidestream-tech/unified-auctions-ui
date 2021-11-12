interface State {
    termsModal: boolean;
    walletModal: boolean;
}

export const state = (): State => ({
    termsModal: false,
    walletModal: false,
});

export const getters = {
    getTermsModal(state: State) {
        return state.termsModal;
    },
    getWalletModal(state: State) {
        return state.walletModal;
    },
};

export const mutations = {
    setTermsModal(state: State, open: boolean): void {
        state.termsModal = open;
    },
    setWalletModal(state: State, open: boolean): void {
        state.walletModal = open;
    },
};

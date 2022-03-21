interface State {
    termsModal: boolean;
    walletModal: boolean;
    manageVATModal: boolean;
}

export const state = (): State => ({
    termsModal: false,
    walletModal: false,
    manageVATModal: false,
});

export const getters = {
    getTermsModal(state: State) {
        return state.termsModal;
    },
    getWalletModal(state: State) {
        return state.walletModal;
    },
    getManageVATModal(state: State) {
        return state.manageVATModal;
    },
};

export const mutations = {
    setTermsModal(state: State, open: boolean): void {
        state.termsModal = open;
    },
    setWalletModal(state: State, open: boolean): void {
        state.walletModal = open;
    },
    setManageVATModal(state: State, open: boolean): void {
        state.manageVATModal = open;
    },
};

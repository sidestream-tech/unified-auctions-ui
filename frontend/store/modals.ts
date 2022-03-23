interface State {
    termsModal: boolean;
    selectWalletModal: boolean;
    walletModal: boolean;
}

export const state = (): State => ({
    termsModal: false,
    walletModal: false,
    selectWalletModal: false,
});

export const getters = {
    getTermsModal(state: State) {
        return state.termsModal;
    },
    getSelectWalletModal(state: State) {
        return state.selectWalletModal;
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
    setSelectWalletModal(state: State, open: boolean): void {
        state.selectWalletModal = open;
    },
};

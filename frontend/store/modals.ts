import { ActionContext } from 'vuex';

interface State {
    termsModal: boolean;
    selectWalletModal: boolean;
    walletModal: boolean;
    collateralModal: boolean;
}

export const state = (): State => ({
    termsModal: false,
    walletModal: false,
    selectWalletModal: false,
    collateralModal: false,
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
    getCollateralModal(state: State) {
        return state.collateralModal;
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
    setCollateralModal(state: State, open: boolean): void {
        state.collateralModal = open;
    },
};

export const actions = {
    setWalletModalAndFetchData({ commit }: ActionContext<State, State>, open: boolean) {
        commit('setWalletModal', open);
    },
};

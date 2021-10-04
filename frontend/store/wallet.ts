import { ActionContext } from 'vuex';
import { message } from 'ant-design-vue';
import getWallet, { WALLETS } from '~/lib/wallet';

interface State {
    walletType?: string;
    address?: string;
    isLoading: boolean;
}

export const state = (): State => ({
    address: undefined,
    walletType: undefined,
    isLoading: false,
});

export const getters = {
    getAddress(state: State) {
        return state.address;
    },
    isLoading(state: State) {
        return state.isLoading;
    },
    getWalletType(state: State) {
        return state.walletType;
    },
};

export const mutations = {
    setWalletType(state: State, walletType: string): void {
        state.walletType = walletType;
    },
    setIsLoading(state: State, isLoading: boolean): void {
        state.isLoading = isLoading;
    },
    setAddress(state: State, address: string): void {
        state.address = address;
    },
};

export const actions = {
    async autoConnect({ dispatch }: ActionContext<State, State>) {
        for (const wallet of WALLETS) {
            if (!wallet.isConnected || !wallet.isLoggedIn) {
                continue;
            }
            await dispatch('connect', wallet.title);
            break;
        }
    },
    async changeWalletType({ dispatch }: ActionContext<State, State>, walletType: string): Promise<void> {
        if (walletType) {
            await dispatch('connect', walletType);
        } else {
            await dispatch('disconnect');
        }
    },
    async connect({ commit }: ActionContext<State, State>, walletType: string): Promise<void> {
        const wallet = getWallet(walletType);
        if (!wallet) {
            return;
        }
        commit('setIsLoading', true);
        try {
            await wallet.connect();
            commit('setAddress', wallet.address);
            commit('setWalletType', walletType);
        } catch (error) {
            message.error(`Wallet connection error: ${error.message}`);
        } finally {
            commit('setIsLoading', false);
        }
    },
    async disconnect({ getters, commit }: ActionContext<State, State>): Promise<void> {
        commit('setIsLoading', true);
        const wallet = getWallet(getters.getWallet);
        if (wallet) {
            await wallet.disconnect();
        }
        commit('setIsLoading', false);
        commit('setWalletType', undefined);
        commit('setAddress', undefined);
    },
    setAddress({ commit }: ActionContext<State, State>, address: string): void {
        commit('setAddress', address);
        if (!address) {
            commit('setWalletType', undefined);
        }
    },
};

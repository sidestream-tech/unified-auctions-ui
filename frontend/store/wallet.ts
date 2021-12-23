import { ActionContext } from 'vuex';
import { message } from 'ant-design-vue';
import { addMakerAccount } from 'auctions-core/src/maker';
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
    isConnected(state: State) {
        return !!state.address;
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
            dispatch('authorizations/refetch', undefined, { root: true });
        } else {
            await dispatch('disconnect');
            dispatch('authorizations/reset', undefined, { root: true });
        }
    },
    async connect({ commit, rootGetters, dispatch }: ActionContext<State, State>, walletType: string): Promise<void> {
        dispatch('authorizations/reset', undefined, { root: true });
        commit('setIsLoading', true);
        try {
            const wallet = getWallet(walletType);
            await wallet.connect();
            commit('setAddress', wallet.address);
            if (wallet.address) {
                const network = rootGetters['network/getMakerNetwork'];
                if (network) {
                    await addMakerAccount(wallet.address, network);
                }
            }
            commit('setWalletType', walletType);
        } catch (error) {
            message.error(`Wallet connection error: ${error.message}`);
        } finally {
            commit('setIsLoading', false);
        }
    },
    async disconnect({ getters, commit, dispatch }: ActionContext<State, State>): Promise<void> {
        commit('setIsLoading', true);
        try {
            const wallet = getWallet(getters.getWallet);
            await wallet.disconnect();
        } finally {
            commit('setIsLoading', false);
        }
        commit('setWalletType', undefined);
        commit('setAddress', undefined);
        dispatch('authorizations/reset', undefined, { root: true });
    },
    setAddress({ commit }: ActionContext<State, State>, address: string): void {
        commit('setAddress', address);
        if (!address) {
            commit('setWalletType', undefined);
        }
    },
};

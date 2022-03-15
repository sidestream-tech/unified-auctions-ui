import type { WalletBalances } from 'auctions-core/src/types';
import { ActionContext } from 'vuex';
import { message } from 'ant-design-vue';
import BigNumber from 'bignumber.js';
import { fetchWalletBalances, depositToVAT, withdrawFromVAT } from 'auctions-core/src/wallet';
import getWallet, { WALLETS } from '~/lib/wallet';
import notifier from '~/lib/notifier';

interface State {
    walletType?: string;
    address?: string;
    isConnecting: boolean;
    walletBalances?: WalletBalances;
    isFetchingBalances: boolean;
    isDepositingOrWithdrawing: boolean;
}

export const state = (): State => ({
    address: undefined,
    walletType: undefined,
    isConnecting: false,
    walletBalances: undefined,
    isFetchingBalances: false,
    isDepositingOrWithdrawing: false,
});

export const getters = {
    getAddress(state: State) {
        return state.address;
    },
    isConnected(state: State) {
        return !!state.address;
    },
    isLoading(state: State) {
        return state.isConnecting;
    },
    getWalletType(state: State) {
        return state.walletType;
    },
};

export const mutations = {
    setWalletType(state: State, walletType: string): void {
        state.walletType = walletType;
    },
    setIsConnecting(state: State, isConnecting: boolean): void {
        state.isConnecting = isConnecting;
    },
    setAddress(state: State, address: string): void {
        state.address = address;
    },
    setWalletBalances(state: State, walletBalances: WalletBalances): void {
        state.walletBalances = { ...walletBalances };
    },
    clearWalletBalances(state: State): void {
        state.walletBalances = undefined;
    },
    setIsFetchingBalances(state: State, isFetchingBalances: boolean): void {
        state.isFetchingBalances = isFetchingBalances;
    },
    setIsDepositingOrWithdrawing(state: State, isDepositingOrWithdrawing: boolean): void {
        state.isDepositingOrWithdrawing = isDepositingOrWithdrawing;
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
    async connect({ commit, dispatch }: ActionContext<State, State>, walletType: string): Promise<void> {
        dispatch('authorizations/reset', undefined, { root: true });
        commit('setIsConnecting', true);
        try {
            const wallet = getWallet(walletType);
            await wallet.connect();
            commit('setAddress', wallet.address);
            commit('setWalletType', walletType);
        } catch (error) {
            message.error(`Wallet connection error: ${error.message}`);
        } finally {
            commit('setIsConnecting', false);
        }
    },
    async disconnect({ getters, commit, dispatch }: ActionContext<State, State>): Promise<void> {
        commit('setIsConnecting', true);
        try {
            const wallet = getWallet(getters.getWallet);
            await wallet.disconnect();
        } finally {
            commit('setIsConnecting', false);
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
    async fetchWalletBalances({ commit, getters, rootGetters }: ActionContext<State, State>): Promise<void> {
        const network = rootGetters['network/getMakerNetwork'];
        commit('setIsFetchingBalances', true);
        try {
            const walletBalances = await fetchWalletBalances(network, getters.getAddress);
            commit('setWalletBalances', walletBalances);
        } catch (error) {
            commit('clearWalletBalances');
            message.error(`Error while fetching wallet balances: ${error.message}`);
        } finally {
            commit('setIsFetchingBalances', false);
        }
    },
    async depositToVAT(
        { commit, getters, rootGetters }: ActionContext<State, State>,
        amount: BigNumber | string
    ): Promise<void> {
        const network = rootGetters['network/getMakerNetwork'];
        commit('setIsDepositingOrWithdrawing', true);
        try {
            await depositToVAT(network, getters.getAddress, new BigNumber(amount), notifier);
        } finally {
            commit('setIsDepositingOrWithdrawing', false);
        }
    },
    async withdrawFromVAT(
        { commit, getters, rootGetters }: ActionContext<State, State>,
        amount: BigNumber | string
    ): Promise<void> {
        const network = rootGetters['network/getMakerNetwork'];
        commit('setIsDepositingOrWithdrawing', true);
        try {
            await withdrawFromVAT(network, getters.getAddress, new BigNumber(amount), notifier);
        } finally {
            commit('setIsDepositingOrWithdrawing', false);
        }
    },
};

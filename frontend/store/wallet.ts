import type { WalletBalances } from 'auctions-core/src/types';
import Vue from 'vue';
import { ActionContext } from 'vuex';
import { message } from 'ant-design-vue';
import BigNumber from 'bignumber.js';
import {
    fetchWalletBalances,
    depositToVAT,
    withdrawFromVAT,
    fetchCollateralVatBalance,
    withdrawCollateralFromVat,
} from 'auctions-core/src/wallet';
import getWallet, { WALLETS } from '~/lib/wallet';
import notifier from '~/lib/notifier';
import { getContractAddressByName } from '~/../core/src/contracts';

interface State {
    walletType?: string;
    address?: string;
    isConnecting: boolean;
    walletBalances?: WalletBalances;
    isFetchingBalances: boolean;
    isDepositingOrWithdrawing: boolean;
    depositingOrWithdrawingCollaterals: string[];
    tokenAddressDai: string;
    isFetchingCollateralVatBalance: boolean;
    collateralVatBalanceStore: Record<string, BigNumber | undefined>;
}

const getInitialState = (): State => ({
    address: undefined,
    walletType: undefined,
    isConnecting: false,
    walletBalances: undefined,
    isFetchingBalances: false,
    isDepositingOrWithdrawing: false,
    depositingOrWithdrawingCollaterals: [],
    tokenAddressDai: '',
    isFetchingCollateralVatBalance: false,
    collateralVatBalanceStore: {},
});

export const state = (): State => getInitialState();

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
    walletBalances(state: State) {
        return state.walletBalances;
    },
    isFetchingBalances(state: State) {
        return state.isFetchingBalances;
    },
    isDepositingOrWithdrawing(state: State) {
        return state.isDepositingOrWithdrawing;
    },
    tokenAddressDai(state: State) {
        return state.tokenAddressDai;
    },
    isFetchingCollateralVatBalance(state: State) {
        return state.isFetchingCollateralVatBalance;
    },
    collateralVatBalanceStore(state: State) {
        return state.collateralVatBalanceStore;
    },
    depositingOrWithdrawingCollaterals(state: State) {
        return state.depositingOrWithdrawingCollaterals;
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
    setDepositingOrWithdrawingCollaterals(
        state: State,
        { collateralType, isDepositingOrWithdrawing }: { collateralType: string; isDepositingOrWithdrawing: boolean }
    ): void {
        if (isDepositingOrWithdrawing) {
            state.depositingOrWithdrawingCollaterals.push(collateralType);
        } else {
            state.depositingOrWithdrawingCollaterals = state.depositingOrWithdrawingCollaterals.filter(
                c => c !== collateralType
            );
        }
    },
    setTokenAddressDai(state: State, tokenAddressDai: string): void {
        state.tokenAddressDai = tokenAddressDai;
    },
    setIsFetchingCollateralVatBalance(state: State, isFetchingCollateralVatBalance: boolean): void {
        state.isFetchingCollateralVatBalance = isFetchingCollateralVatBalance;
    },
    setCollateralVatBalance(
        state: State,
        { collateralType, balance }: { collateralType: string; balance: BigNumber }
    ): void {
        state.collateralVatBalanceStore[collateralType] = balance;
        Vue.set(state.collateralVatBalanceStore, collateralType, balance);
    },
    reset(state: State) {
        const initialState = getInitialState();
        Object.assign(state, {
            ...initialState,
            address: state.address,
            walletType: state.walletType,
        });
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
        const walletAddress = getters.getAddress;
        if (!walletAddress || !network) {
            commit('clearWalletBalances');
            return;
        }
        commit('setIsFetchingBalances', true);
        try {
            const walletBalances = await fetchWalletBalances(network, walletAddress);
            commit('setWalletBalances', walletBalances);
        } catch (error) {
            commit('clearWalletBalances');
            message.error(`Error while fetching wallet balances: ${error.message}`);
        } finally {
            commit('setIsFetchingBalances', false);
        }
    },
    async depositToVAT(
        { commit, dispatch, getters, rootGetters }: ActionContext<State, State>,
        amount: BigNumber | string
    ): Promise<void> {
        const network = rootGetters['network/getMakerNetwork'];
        commit('setIsDepositingOrWithdrawing', true);
        try {
            await depositToVAT(network, getters.getAddress, new BigNumber(amount), notifier);
            await dispatch('fetchWalletBalances');
            await dispatch('authorizations/fetchAllowanceAmount', undefined, { root: true });
        } catch (error) {
            message.error(`Error while depositing to VAT: ${error.message}`);
        } finally {
            commit('setIsDepositingOrWithdrawing', false);
        }
    },
    async withdrawFromVAT(
        { commit, dispatch, getters, rootGetters }: ActionContext<State, State>,
        amount: BigNumber | string
    ): Promise<void> {
        const network = rootGetters['network/getMakerNetwork'];
        commit('setIsDepositingOrWithdrawing', true);
        try {
            await withdrawFromVAT(network, getters.getAddress, new BigNumber(amount), notifier);
            await dispatch('fetchWalletBalances');
        } catch (error) {
            message.error(`Error while withdrawing from VAT: ${error.message}`);
        } finally {
            commit('setIsDepositingOrWithdrawing', false);
        }
    },
    async fetchTokenAddressDai({ commit, rootGetters }: ActionContext<State, State>) {
        const network = rootGetters['network/getMakerNetwork'];
        try {
            const tokenAddressDai = await getContractAddressByName(network, 'MCD_DAI');
            await commit('setTokenAddressDai', tokenAddressDai);
        } catch (error) {
            await commit('setTokenAddressDai', undefined);
        }
    },
    async fetchCollateralVatBalance(
        { commit, getters, rootGetters }: ActionContext<State, State>,
        collateralType: string
    ): Promise<void> {
        const network = rootGetters['network/getMakerNetwork'];
        const walletAddress = getters.getAddress;
        if (!walletAddress || !network) {
            commit('setCollateralVatBalance', { collateralType, balance: undefined });
            return;
        }
        commit('setIsFetchingCollateralVatBalance', true);
        try {
            const collateralVatBalance = await fetchCollateralVatBalance(network, walletAddress, collateralType);
            commit('setCollateralVatBalance', { collateralType, balance: collateralVatBalance });
        } catch (error) {
            commit('setCollateralVatBalance', { collateralType, balance: undefined });
            message.error(`Error while fetching "${collateralType}" collateral vat balance: ${error.message}`);
        } finally {
            commit('setIsFetchingCollateralVatBalance', false);
        }
    },
    async withdrawAllCollateralFromVat(
        { commit, dispatch, getters, rootGetters }: ActionContext<State, State>,
        collateralType: string
    ): Promise<void> {
        const network = rootGetters['network/getMakerNetwork'];
        commit('setDepositingOrWithdrawingCollaterals', { collateralType, isDepositingOrWithdrawing: true });
        commit('setIsDepositingOrWithdrawing', true);
        try {
            await withdrawCollateralFromVat(network, getters.getAddress, collateralType, undefined, notifier);
            await dispatch('fetchCollateralVatBalance', collateralType);
        } catch (error) {
            message.error(`Error while withdrawing "${collateralType}" collateral from VAT: ${error.message}`);
        } finally {
            commit('setDepositingOrWithdrawingCollaterals', { collateralType, isDepositingOrWithdrawing: false });
            commit('setIsDepositingOrWithdrawing', false);
        }
    },
    async refetch({ dispatch }: ActionContext<State, State>): Promise<void> {
        await dispatch('fetchWalletBalances');
        await dispatch('fetchTokenAddressDai');
        const auctionParam = window?.$nuxt?.$route?.query?.auction;
        const auctionId = Array.isArray(auctionParam) ? auctionParam[0] : auctionParam;
        const collateralType = auctionId ? auctionId.split(':')[0] : '';
        if (collateralType) {
            await dispatch('fetchCollateralVatBalance', collateralType);
        }
    },
    setup({ commit, dispatch }: ActionContext<State, State>): void {
        commit('reset');
        dispatch('refetch');
        dispatch('debt/setup', undefined, { root: true });
    },
};

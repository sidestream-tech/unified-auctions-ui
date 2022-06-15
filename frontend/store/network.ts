import { message } from 'ant-design-vue';
import { ActionContext } from 'vuex';
import {
    getNetworkConfigByType,
    getNetworkTypeByChainId,
    getNetworkTitleByChainId,
} from 'auctions-core/src/constants/NETWORKS';
import getWallet from '~/lib/wallet';

const DEFAULT_NETWORK = process.env.DEFAULT_ETHEREUM_NETWORK;
const NETWORK_SWITCH_TIMEOUT = 8000;
let networkChangeTimeoutId: ReturnType<typeof setTimeout> | undefined;

interface State {
    walletChainId: string | undefined;
    isChangingNetwork: boolean;
}

export const state = (): State => ({
    walletChainId: undefined,
    isChangingNetwork: false,
});

export const getters = {
    getWalletChainId(state: State) {
        return state.walletChainId;
    },
    isWalletConnected(_state: State, getters: any) {
        return !!getters.getWalletChainId;
    },
    getWalletNetwork(state: State) {
        return getNetworkTypeByChainId(state.walletChainId);
    },
    getWalletNetworkTitle(_state: State, getters: any) {
        return getNetworkTitleByChainId(getters.getWalletChainId) || getters.getWalletChainId;
    },
    getPageNetwork(_state: State, _getters: any, rootState: any) {
        const pageNetwork = rootState.route.query.network;
        if (!pageNetwork) {
            return DEFAULT_NETWORK;
        }
        return pageNetwork;
    },
    isPageNetworkValid(_state: State, getters: any) {
        try {
            getNetworkConfigByType(getters.getPageNetwork);
            return true;
        } catch {
            return false;
        }
    },
    isWalletNetworkValid(_state: State, getters: any) {
        if (!getters.isWalletConnected) {
            return true;
        }
        return getters.getPageNetwork === getters.getWalletNetwork;
    },
    getMakerNetwork(_state: State, getters: any) {
        if (!getters.isPageNetworkValid) {
            return;
        }
        if (!getters.isWalletNetworkValid) {
            return;
        }
        return getters.getPageNetwork;
    },
    isChangingNetwork(state: State) {
        return state.isChangingNetwork;
    },
};

export const mutations = {
    setWalletChainId(state: State, walletChainId: string): void {
        state.walletChainId = walletChainId;
    },
    setIsChangingNetwork(state: State, isChangingNetwork: boolean): void {
        state.isChangingNetwork = isChangingNetwork;
    },
};

export const actions = {
    setWalletChainId({ commit }: ActionContext<State, State>, walletChainId: string): void {
        commit('setWalletChainId', walletChainId);
    },
    async setPageNetwork(
        { getters, dispatch, commit, rootState }: ActionContext<State, any>,
        newNetwork: string
    ): Promise<void> {
        const oldNetwork = getters.getPageNetwork;
        if (newNetwork === oldNetwork) {
            return;
        }
        commit('setIsChangingNetwork', true);
        try {
            await dispatch('setWalletNetwork', newNetwork);
            await window.$nuxt.$router.replace({
                path: rootState.route.path,
                query: {
                    network: newNetwork,
                },
            });
            if (networkChangeTimeoutId) {
                clearTimeout(networkChangeTimeoutId);
            }

            networkChangeTimeoutId = setTimeout(() => {
                message.error(`Failed to change network to ${newNetwork}`);
                commit('setIsChangingNetwork', false);
                window.$nuxt.$router.replace({
                    query: {
                        network: oldNetwork,
                    },
                });
            }, NETWORK_SWITCH_TIMEOUT);
        } catch (error) {
            message.error(`Network switch error: ${error.message}`);
            commit('setIsChangingNetwork', false);
        }
    },
    async setWalletNetwork(_: ActionContext<State, State>, newNetwork: string): Promise<void> {
        let wallet;
        try {
            wallet = getWallet();
        } catch {}
        if (wallet) {
            await wallet.switchNetwork(newNetwork);
        }
    },
    async fixWalletNetwork({ dispatch, getters }: ActionContext<State, State>): Promise<void> {
        try {
            await dispatch('setWalletNetwork', getters.getPageNetwork);
        } catch (error) {
            message.error(`Network switch error: ${error.message}`);
        }
    },
    async setup({ commit, dispatch }: ActionContext<State, State>): Promise<void> {
        commit('setIsChangingNetwork', false);
        await dispatch('wallet/setup', undefined, { root: true });
        await dispatch('auctions/setup', undefined, { root: true });
        await dispatch('authorizations/setup', undefined, { root: true });
        await dispatch('gas/setup', undefined, { root: true });
    },
};

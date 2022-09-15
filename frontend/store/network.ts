import { message } from 'ant-design-vue';
import { ActionContext } from 'vuex';
import { getNetworkTypeByChainId } from 'auctions-core/src/network';
import { setupRpcUrlAndGetNetworks } from 'auctions-core/src/rpc';
import { getTestQuote } from 'auctions-core/src/calleeFunctions/helpers/uniswapAutoRouter';
import { NetworkConfig } from 'auctions-core/src/types';
import getWallet from '~/lib/wallet';

const NETWORK_SWITCH_TIMEOUT = 8000;
let networkChangeTimeoutId: ReturnType<typeof setTimeout> | undefined;

interface State {
    walletChainId: string | undefined;
    isChangingNetwork: boolean;
    networks: NetworkConfig[];
    defaultChainId?: string;
    defaultNetwork?: string;
}

export const state = (): State => ({
    walletChainId: undefined,
    isChangingNetwork: false,
    networks: [],
    defaultChainId: undefined,
    defaultNetwork: undefined,
});

export const getters = {
    networks(state: State) {
        return state.networks;
    },
    getNetworkConfigByType: (state: State) => (network: string) => {
        return state.networks.find(n => n.type === network);
    },
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
        return getNetworkTypeByChainId(getters.getWalletChainId) || getters.getWalletChainId;
    },
    getPageNetwork(state: State, _getters: any, rootState: any) {
        const pageNetwork = rootState.route.query.network;
        if (!pageNetwork) {
            return state.defaultNetwork;
        }
        return pageNetwork;
    },
    getPageChainId(state: State, getters: any, rootState: any) {
        const pageNetwork = rootState.route.query.network;
        const pageNetworkConfig = getters.getNetworkConfigByType(pageNetwork);
        if (pageNetworkConfig && pageNetworkConfig.chainId) {
            return pageNetworkConfig.chainId;
        }
        return state.defaultChainId;
    },
    isPageNetworkValid(state: State, getters: any) {
        try {
            return state.networks.some(n => n.chainId === getters.getPageChainId);
        } catch {
            return false;
        }
    },
    isWalletNetworkValid(_state: State, getters: any) {
        if (!getters.isWalletConnected) {
            return true;
        }
        return getters.getPageChainId === getters.getWalletChainId;
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
    setListOfNetworks(state: State, networks: NetworkConfig[]): void {
        state.networks = networks;
    },
    setDefaultChainId(state: State, defaultChainId: string): void {
        state.defaultChainId = defaultChainId;
    },
    setDefaultNetwork(state: State, defaultNetwork: string): void {
        state.defaultNetwork = defaultNetwork;
    },
};

export const actions = {
    async setup({ dispatch }: ActionContext<State, State>, isDev?: boolean): Promise<void> {
        await dispatch('setupNetworks', isDev);
        await dispatch('wallet/setup', undefined, { root: true });
        await dispatch('gas/setup', undefined, { root: true });
        await dispatch('auctions/setup', undefined, { root: true });
        await dispatch('authorizations/setup', undefined, { root: true });
        await dispatch('surplus/setup', undefined, { root: true });
        await dispatch('debt/setup', undefined, { root: true });
    },
    async setupNetworks({ commit }: ActionContext<State, State>, isDev?: boolean) {
        commit('setIsChangingNetwork', true);
        if (networkChangeTimeoutId) {
            clearTimeout(networkChangeTimeoutId);
        }
        const { networks, defaultChainId, defaultNetwork } = await setupRpcUrlAndGetNetworks(
            process.env.RPC_URL,
            isDev
        );
        commit('setListOfNetworks', networks);
        commit('setDefaultChainId', defaultChainId);
        commit('setDefaultNetwork', defaultNetwork);
        commit('setIsChangingNetwork', false);
    },
    setWalletChainId({ commit }: ActionContext<State, State>, walletChainId: string): void {
        commit('setWalletChainId', walletChainId);
    },
    async setPageNetwork({ getters, dispatch, commit }: ActionContext<State, any>, newNetwork: string): Promise<void> {
        const oldNetwork = getters.getPageNetwork;
        if (newNetwork === oldNetwork) {
            return;
        }
        commit('setIsChangingNetwork', true);
        try {
            await dispatch('setWalletNetwork', newNetwork);
            window.$nuxt.$router.push({
                query: {
                    network: newNetwork,
                },
            });

            if (networkChangeTimeoutId) {
                clearTimeout(networkChangeTimeoutId);
            }

            networkChangeTimeoutId = setTimeout(() => {
                if (getters.getMakerNetwork || getters.getMakerNetwork === newNetwork) {
                    return;
                }
                message.error(`Failed to change network to ${newNetwork}`);
                commit('setIsChangingNetwork', false);
                window.$nuxt.$router.push({
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
    async getTestQuote({ getters, rootGetters }: ActionContext<State, State>): Promise<void> {
        await getTestQuote(getters.getMakerNetwork, rootGetters['wallet/getAddress']);
    },
};

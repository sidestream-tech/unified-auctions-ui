import { message } from 'ant-design-vue';
import { ActionContext } from 'vuex';
import { NetworkConfig } from 'auctions-core//src/types';
import setupNetworks from 'auctions-core/src/networks';
import { getNetworkTitleByChainId } from 'auctions-core/src/constants/NETWORKS';
import getWallet from '~/lib/wallet';

const NETWORK_SWITCH_TIMEOUT = 8000;
let networkChangeTimeoutId: ReturnType<typeof setTimeout> | undefined;

interface State {
    walletChainId: string | undefined;
    networks: NetworkConfig[];
    isChangingNetwork: boolean;
}

export const state = (): State => ({
    walletChainId: undefined,
    networks: [],
    isChangingNetwork: false,
});

export const getters = {
    getAllNetworks(state: State) {
        return state.networks;
    },
    getNetworkConfigByType(state: State, networkType: string) {
        return state.networks.find(network => {
            return network.title === networkType;
        });
    },
    getWalletChainId(state: State) {
        return state.walletChainId;
    },
    isWalletConnected(_state: State, getters: any) {
        return !!getters.getWalletChainId;
    },
    getWalletNetwork(state: State) {
        const networkEntry = Object.entries(state.networks).find(
            ([_, networkObject]) => networkObject.chainId === state.walletChainId
        );
        return networkEntry && networkEntry[0];
    },
    getWalletNetworkTitle(_state: State, getters: any) {
        return getNetworkTitleByChainId(getters.getWalletChainId) || getters.getWalletChainId;
    },
    getPageNetwork(state: State, _getters: any, rootState: any) {
        const pageNetwork = rootState.route.query.network;
        if (!pageNetwork) {
            return state.networks[0];
        }
        return pageNetwork;
    },
    isPageNetworkValid(state: State, getters: any) {
        const networkConfig = Object.values(state.networks).find(network => {
            return network.title === getters.getPageNetwork;
        });

        return !networkConfig;
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
    setNetworks(state: State, networks: NetworkConfig[]) {
        state.networks = networks;
    },
    setWalletChainId(state: State, walletChainId: string): void {
        state.walletChainId = walletChainId;
    },
    setIsChangingNetwork(state: State, isChangingNetwork: boolean): void {
        state.isChangingNetwork = isChangingNetwork;
    },
};

export const actions = {
    async setupNetworks({ commit }: ActionContext<State, any>) {
        const networks = await setupNetworks(process.env.RPC_URL);
        commit('setNetworks', networks);
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
    async setup({ commit, dispatch }: ActionContext<State, State>): Promise<void> {
        if (networkChangeTimeoutId) {
            clearTimeout(networkChangeTimeoutId);
        }
        await dispatch('setupNetworks');
        commit('setIsChangingNetwork', false);
        await dispatch('wallet/setup', undefined, { root: true });
        await dispatch('auctions/setup', undefined, { root: true });
        await dispatch('authorizations/setup', undefined, { root: true });
        await dispatch('gas/setup', undefined, { root: true });
    },
};

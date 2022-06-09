import { message } from 'ant-design-vue';
import { ActionContext } from 'vuex';
import { NetworkConfig } from 'auctions-core/dist/src/types';
import setupNetworks, { getNetworkConfigByType, getNetworkTypeByChainId } from 'auctions-core/src/networks';
import { getNetworkTitleByChainId } from 'auctions-core/src/constants/NETWORKS';
import getWallet from '~/lib/wallet';

interface State {
    walletChainId: string | undefined;
    defaultNetwork: string | undefined;
    networks: Record<string, NetworkConfig>;
}

export const state = (): State => ({
    walletChainId: undefined,
    defaultNetwork: undefined,
    networks: {},
});

export const getters = {
    getAllNetworks(state: State) {
        return state.networks;
    },
    getNetworkConfigByType(state: State, networkType: string) {
        return state.networks[networkType] || undefined;
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
        return getNetworkTitleByChainId(getters.getWalletChainId) || getters.getWalletChainId;
    },
    getPageNetwork(state: State, _getters: any, rootState: any) {
        const pageNetwork = rootState.route.query.network;
        if (!pageNetwork) {
            return state.defaultNetwork;
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
};

export const mutations = {
    setAllNetworks(state: State, networks: Record<string, NetworkConfig>) {
        state.networks = networks;
    },
    setWalletChainId(state: State, walletChainId: string): void {
        state.walletChainId = walletChainId;
    },
    setDefaultNetwork(state: State, network: string) {
        state.defaultNetwork = network;
    },
};

export const actions = {
    async setupNetworks({ commit }: ActionContext<State, any>) {
        const networks = await setupNetworks();
        commit('setAllNetworks', networks);
    },
    setWalletChainId({ commit }: ActionContext<State, State>, walletChainId: string): void {
        commit('setWalletChainId', walletChainId);
    },
    async setPageNetwork(
        { getters, dispatch, rootState }: ActionContext<State, any>,
        newNetwork: string
    ): Promise<void> {
        const oldNetwork = getters.getPageNetwork;
        if (newNetwork === oldNetwork) {
            return;
        }
        try {
            await dispatch('setWalletNetwork', newNetwork);
            window.location.href = `${rootState.route.path}?network=${newNetwork}`;
        } catch (error) {
            message.error(`Network switch error: ${error.message}`);
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
            window.location.reload();
        } catch (error) {
            message.error(`Network switch error: ${error.message}`);
        }
    },
};

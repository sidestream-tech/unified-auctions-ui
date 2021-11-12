import { message } from 'ant-design-vue';
import { ActionContext } from 'vuex';
import getWallet from '~/lib/wallet';
import { getChainIdByNetworkType, getNetworkTypeByChainId } from '~/lib/constants/NETWORKS';

interface State {
    network: string | null;
    isExplanationsShown: boolean;
    isDarkMode: boolean | undefined;
    acceptedTerms: boolean;
    chainID: string | null;
}

export const state = (): State => ({
    network: 'kovan',
    chainID: '0x2a',
    isExplanationsShown: true,
    isDarkMode: undefined,
    acceptedTerms: false,
});

export const getters = {
    getNetwork(state: State) {
        return state.network;
    },
    getIsExplanationsShown(state: State) {
        return state.isExplanationsShown;
    },
    getIsDarkMode(state: State) {
        if (state.isDarkMode === undefined) {
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        return state.isDarkMode;
    },
    getChainID(state: State) {
        return state.chainID;
    },
    getIsInvalidNetwork(state: State): boolean {
        if (!state.network) {
            return false;
        }
        return !getNetworkTypeByChainId(state.chainID);
    },
    getAcceptedTerms(state: State): boolean {
        return state.acceptedTerms;
    },
};

export const mutations = {
    setNetwork(state: State, network: string | null): void {
        state.network = network;
    },
    setExplanations(state: State, isExplanationsShown: boolean): void {
        state.isExplanationsShown = isExplanationsShown;
    },
    setIsDarkMode(state: State, isDarkMode: boolean): void {
        state.isDarkMode = isDarkMode;
    },
    setChainID(state: State, chainID: string | null): void {
        state.chainID = chainID;
    },
    setAcceptedTerms(state: State, accepted: boolean): void {
        state.acceptedTerms = accepted;
    },
};

export const actions = {
    async setChainID({ commit, dispatch }: ActionContext<State, State>, chainID: string): Promise<void> {
        commit('setChainID', chainID);

        const network = getNetworkTypeByChainId(chainID);
        if (network) {
            await dispatch('setNetwork', network);
        } else {
            commit('setNetwork', chainID);
        }
    },
    async setNetwork({ commit, getters }: ActionContext<State, State>, newNetwork: string | null): Promise<void> {
        const oldNetwork = getters.getNetwork;
        const hasNetworkChanged = newNetwork !== oldNetwork;
        const isStubNetwork = newNetwork === null;
        const wasStubNetwork = oldNetwork === null;

        // ask wallet to change the network
        if (hasNetworkChanged && newNetwork) {
            try {
                let wallet;
                try {
                    wallet = getWallet();
                } catch (error) {
                    console.info('wallet is not yet connected', error);
                }
                if (wallet) {
                    await wallet.switchNetwork(newNetwork);
                }
            } catch (error) {
                message.error(`Network switch error: ${error.message}`);
                // terminate the change on error
                return;
            }
        }

        // Set ChainID
        const chainID = getChainIdByNetworkType(newNetwork);
        commit('setChainID', chainID);

        // save changes to the local store
        commit('setNetwork', newNetwork);

        // reload the page only if changed from or to a real network
        if (hasNetworkChanged && !wasStubNetwork && !isStubNetwork) {
            window.location.reload();
        }
    },
    setExplanationsAction({ commit }: ActionContext<State, State>, isExplanationsShown: boolean): void {
        commit('setExplanations', isExplanationsShown);
    },
    setIsDarkMode({ commit }: ActionContext<State, State>, isDarkMode: boolean): void {
        commit('setIsDarkMode', isDarkMode);
    },
};

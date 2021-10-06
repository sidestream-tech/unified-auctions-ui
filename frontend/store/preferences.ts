import { message } from 'ant-design-vue';
import { ActionContext } from 'vuex';
import getWallet from '~/lib/wallet';

interface State {
    network: string | null;
    isExplanationsShown: boolean;
    isDarkMode: boolean | undefined;
}

export const state = (): State => ({
    network: null,
    isExplanationsShown: true,
    isDarkMode: undefined,
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
};

export const actions = {
    async setNetwork({ commit, getters }: ActionContext<State, State>, newNetwork: string | null): Promise<void> {
        const oldNetwork = getters.getNetwork;
        const hasNetworkChanged = newNetwork !== oldNetwork;
        const isStubNetwork = newNetwork === null;
        const wasStubNetwork = oldNetwork === null;

        // ask wallet to change the network
        if (hasNetworkChanged && newNetwork) {
            try {
                const wallet = getWallet();
                if (wallet) {
                    await wallet.switchNetwork(newNetwork);
                }
            } catch (error) {
                message.error(`Network switch error: ${error.message}`);
                // terminate the change on error
                return;
            }
        }

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

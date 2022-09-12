import { Vault, VaultTransaction } from 'auctions-core/src/types';
import Vue from 'vue';
import { fetchVault, fetchVaultsCount } from 'auctions-core/src/vaults';
import { ActionContext } from 'vuex';

interface State {
    vaultTransactions: Record<Vault['id'], VaultTransaction>;
    vaultsCount?: number;
    isVaultLoading: boolean;
}

const getInitialState = (): State => ({
    vaultTransactions: {},
    vaultsCount: undefined,
    isVaultLoading: false,
});

export const state = (): State => getInitialState();

export const getters = {};
export const mutations = {
    setVault(state: State, vaultTransaction: VaultTransaction) {
        Vue.set(state, 'vaults', vaultTransaction);
    },
    setIsVaultLoading(state: State, isLoading: boolean) {
        state.isVaultLoading = isLoading;
    },
    setVaultsCount(state: State, count: number) {
        state.vaultsCount = count;
    },
};
export const actions = {
    async fetchVault({ commit, rootGetters }: ActionContext<State, State>, vaultId: number) {
        const network = rootGetters['network/getMakerNetwork'];
        commit('setIsVaultLoading', true);
        try {
            const vaultTransaction = await fetchVault(network, vaultId);
            commit('setVault', vaultTransaction);
        } catch (e) {
            console.error(`Failed to fetch vault ${vaultId}: ${e}`);
        } finally {
            commit('setIsVaultLoading', false);
        }
    },
    async fetchVaultsCount({ rootGetters, commit }: ActionContext<State, State>) {
        const network = rootGetters['network/getMakerNetwork'];
        commit('setIsVaultLoading', true);
        try {
            const vaultCount = await fetchVaultsCount(network);
            commit('setVaultsCount', vaultCount);
        } catch (e) {
            console.error(`Failed to fetch vault count: ${e}`);
        } finally {
            commit('setIsVaultLoading', false);
        }
    },
};

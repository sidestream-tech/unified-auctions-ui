import { Vault, VaultTransaction } from 'auctions-core/src/types';
import Vue from 'vue';
import { fetchVault, fetchVaultsCount, liquidateVault } from 'auctions-core/src/vaults';
import { ActionContext } from 'vuex';

interface State {
    vaultTransactions: Record<Vault['id'], VaultTransaction>;
    isVaultLoading: boolean;
    isVaultBeingLiquidated: boolean;
}

const getInitialState = (): State => ({
    vaultTransactions: {},
    isVaultLoading: false,
    isVaultBeingLiquidated: false,
});

export const state = (): State => getInitialState();

export const getters = {
    vaultTransactions(state: State) {
        return state.vaultTransactions;
    },
};
export const mutations = {
    setVault(state: State, vaultTransaction: VaultTransaction) {
        Vue.set(state, 'vaults', vaultTransaction);
    },
    setIsVaultLoading(state: State, isLoading: boolean) {
        state.isVaultLoading = isLoading;
    },
    setIsVaultBeingLiquidated(state: State, isLoading: boolean) {
        state.isVaultBeingLiquidated = isLoading;
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
    async liquidateVault({ rootGetters, commit, getters }: ActionContext<State, State>, vaultId: number) {
        const network = rootGetters['network/getMakerNetwork'];
        const walletAddress = rootGetters['wallet/getAddress'];
        const vaultTransaction = getters.vaultTransactions[vaultId];
        commit('setIsVaultBeingLiquidated', true);
        try {
            await liquidateVault(network, vaultTransaction, walletAddress);
        } catch (e) {
            console.error(`Failed to liquidate vault ${vaultId}: ${e}`);
        } finally {
            commit('setIsVaultBeingLiquidated', false);
        }
    },
};

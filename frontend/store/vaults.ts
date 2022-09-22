import { Vault, VaultTransaction } from 'auctions-core/src/types';
import Vue from 'vue';
import { getVaultTransaction, fetchVault, liquidateVault } from 'auctions-core/src/vaults';
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
    getVaultById: (state: State) => (id: number) => {
        return state.vaultTransactions[id];
    },
};
export const mutations = {
    setVault(state: State, vaultTransaction: VaultTransaction) {
        Vue.set(state.vaultTransactions, vaultTransaction.id, vaultTransaction);
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
            const vault = await fetchVault(network, vaultId);
            const vaultTransaction = await getVaultTransaction(network, vault);
            commit('setVault', vaultTransaction);
        } catch (e) {
            console.error(`Failed to fetch vault ${vaultId}: ${e}`);
        } finally {
            commit('setIsVaultLoading', false);
        }
    },
    async liquidateVault({ rootGetters, commit, getters, dispatch }: ActionContext<State, State>, vaultId: number) {
        const network = rootGetters['network/getMakerNetwork'];
        const walletAddress = rootGetters['wallet/getAddress'];
        const vaultTransaction: VaultTransaction = getters.getVaultById(vaultId);
        commit('setIsVaultBeingLiquidated', true);
        try {
            await liquidateVault(network, vaultTransaction.collateralType, vaultTransaction.address, walletAddress);
            await dispatch('fetchVault', vaultId);
        } catch (e) {
            console.error(`Failed to liquidate vault ${vaultId}: ${e}`);
        } finally {
            commit('setIsVaultBeingLiquidated', false);
        }
    },
};

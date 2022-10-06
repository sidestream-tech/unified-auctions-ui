import { Vault, VaultTransaction } from 'auctions-core/src/types';
import Vue from 'vue';
import { getVaultTransaction, fetchVault, liquidateVault } from 'auctions-core/src/vaults';
import { ActionContext } from 'vuex';
import notifier from '~/lib/notifier';

const REFETCH_INTERVAL = 30 * 1000;
let refetchIntervalId: ReturnType<typeof setInterval> | undefined;

interface State {
    vaultTransactions: Record<Vault['id'], VaultTransaction>;
    vaultErrors: Record<string, string | undefined>;
    areVaultsLoading: boolean;
    isVaultBeingLiquidated: boolean;
    isVaultLiquidationDone: boolean;
    lastUpdated: Date | undefined;
}

const getInitialState = (): State => ({
    vaultTransactions: {},
    vaultErrors: {},
    areVaultsLoading: false,
    isVaultBeingLiquidated: false,
    isVaultLiquidationDone: false,
    lastUpdated: undefined,
});

export const state = (): State => getInitialState();

export const getters = {
    listVaultTransactions(state: State) {
        return Object.values(state.vaultTransactions);
    },
    getLastUpdated(state: State) {
        return state.lastUpdated;
    },
    getVaultErrors(state: State) {
        return state.vaultErrors;
    },
    areVaultsLoading(state: State) {
        return state.areVaultsLoading;
    },
    isVaultBeingLiquidated(state: State) {
        return state.isVaultBeingLiquidated;
    },
    isVaultLiquidationDone(state: State) {
        return state.isVaultLiquidationDone;
    },
    getVaultById: (state: State) => (id: number) => {
        return state.vaultTransactions[id];
    },
};
export const mutations = {
    setVault(state: State, vaultTransaction: VaultTransaction) {
        state.lastUpdated = new Date();
        Vue.set(state.vaultTransactions, vaultTransaction.id, vaultTransaction);
    },
    setAreVaultsLoading(state: State, isLoading: boolean) {
        state.areVaultsLoading = isLoading;
    },
    setVaultError(state: State, { vaultId, error }: { vaultId: string; error: string }) {
        Vue.set(state.vaultErrors, vaultId, error);
    },
    setIsVaultBeingLiquidated(state: State, isLoading: boolean) {
        state.isVaultBeingLiquidated = isLoading;
    },
    setIsVaultLiquidationDone(state: State, isLiquidated: boolean) {
        state.isVaultLiquidationDone = isLiquidated;
    },
    reset(state: State) {
        Object.assign(state, getInitialState());
    },
};
export const actions = {
    async setup({ dispatch, commit }: ActionContext<State, State>) {
        commit('reset');
        if (refetchIntervalId) {
            clearInterval(refetchIntervalId);
        }
        await dispatch('updateSelectedVault');
        refetchIntervalId = setInterval(() => dispatch('updateSelectedVault'), REFETCH_INTERVAL);
    },
    async updateSelectedVault({ rootState, dispatch }: ActionContext<State, any>) {
        const selectedVaultId = rootState.route.query.vault;
        if (selectedVaultId) {
            await dispatch('fetchVault', selectedVaultId);
        }
    },
    async fetchVault({ commit, rootGetters }: ActionContext<State, State>, vaultId: number) {
        const network = rootGetters['network/getMakerNetwork'];
        commit('setAreVaultsLoading', true);
        try {
            const vault = await fetchVault(network, vaultId);
            const vaultTransaction = await getVaultTransaction(network, vault);
            commit('setVault', vaultTransaction);
        } catch (e) {
            console.error(`Failed to fetch vault ${vaultId}: ${e}`);
            commit('setVaultError', { vaultId, error: e });
        } finally {
            commit('setAreVaultsLoading', false);
        }
    },
    async liquidateVault(
        { rootGetters, commit, getters, dispatch }: ActionContext<State, State>,
        { vaultId, walletAddress }: { vaultId: number; walletAddress?: string }
    ) {
        const network = rootGetters['network/getMakerNetwork'];
        const vaultTransaction: VaultTransaction = getters.getVaultById(vaultId);
        commit('setIsVaultBeingLiquidated', true);
        try {
            await liquidateVault(
                network,
                vaultTransaction.collateralType,
                vaultTransaction.address,
                walletAddress,
                notifier
            );
            await dispatch('fetchVault', vaultId);
            commit('setIsVaultLiquidationDone', true);
        } catch (e) {
            commit('setIsVaultLiquidationDone', false);
            console.error(`Failed to liquidate vault ${vaultId}: ${e}`);
        } finally {
            commit('setIsVaultBeingLiquidated', false);
        }
    },
};

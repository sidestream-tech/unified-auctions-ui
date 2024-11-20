import { Vault, VaultTransaction } from 'auctions-core/src/types';
import Vue from 'vue';
import { getVaultTransaction, liquidateVault, fetchVaultByAddress } from 'auctions-core/src/vaults';
import { ActionContext } from 'vuex';
import notifier from '~/lib/notifier';

const REFETCH_INTERVAL = 30 * 1000;
let refetchIntervalId: ReturnType<typeof setInterval> | undefined;

interface State {
    vaultTransactions: Record<Vault['address'], VaultTransaction>;
    vaultErrors: Record<string, string | undefined>;
    areVaultsLoading: boolean;
    isVaultBeingLiquidated: boolean;
    isVaultLiquidationDone: boolean;
    lastUpdated: Date | undefined;
}

const getInitialState = (): State => ({
    vaultTransactions: {},
    vaultErrors: {},
    areVaultsLoading: true,
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
    getVaultByAddress: (state: State) => (address: string) => {
        return state.vaultTransactions[address];
    },
};
export const mutations = {
    setVault(state: State, vaultTransaction: VaultTransaction) {
        state.lastUpdated = new Date();
        Vue.set(state.vaultTransactions, vaultTransaction.address, vaultTransaction);
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
        const selectedVaultAddress = rootState.route.query.vault;
        if (selectedVaultAddress) {
            await dispatch('fetchVault', selectedVaultAddress);
        }
    },
    async fetchVault({ commit, rootGetters }: ActionContext<State, State>, vaultAddress: string) {
        const network = rootGetters['network/getMakerNetwork'];
        if (!network) {
            return;
        }
        commit('setAreVaultsLoading', true);
        try {
            const vault = await fetchVaultByAddress(network, vaultAddress);
            const vaultTransaction = await getVaultTransaction(network, vault);
            commit('setVault', vaultTransaction);
        } catch (e) {
            console.error(`Failed to fetch vault ${vaultAddress}: ${e}`);
            commit('setVaultError', { vaultAddress, error: e });
        } finally {
            commit('setAreVaultsLoading', false);
        }
    },
    async liquidateVault(
        { rootGetters, commit, getters, dispatch }: ActionContext<State, State>,
        { vaultAddress, walletAddress }: { vaultAddress: string; walletAddress?: string }
    ) {
        const network = rootGetters['network/getMakerNetwork'];
        const vaultTransaction: VaultTransaction = getters.getVaultByAddress(vaultAddress);
        commit('setIsVaultBeingLiquidated', true);
        try {
            await liquidateVault(
                network,
                vaultTransaction.collateralType,
                vaultTransaction.address,
                walletAddress,
                notifier
            );
            await dispatch('fetchVault', vaultAddress);
            commit('setIsVaultLiquidationDone', true);
        } catch (e) {
            commit('setIsVaultLiquidationDone', false);
            console.error(`Failed to liquidate vault ${vaultAddress}: ${e}`);
        } finally {
            commit('setIsVaultBeingLiquidated', false);
        }
    },
};

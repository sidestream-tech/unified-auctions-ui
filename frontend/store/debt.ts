import Vue from 'vue';
import type { DebtAuction, DebtAuctionActionStates, DebtAuctionTransaction } from 'auctions-core/src/types';
import { ActionContext } from 'vuex';
import BigNumber from 'bignumber.js';
import { getTokenAddressByNetworkAndSymbol } from 'auctions-core/src/tokens';
import {
    bidToDebtAuction,
    collectDebtAuction,
    enrichDebtAuctions,
    fetchActiveDebtAuctions,
    restartDebtAuction,
} from 'auctions-core/src/debt';

import notifier from '~/lib/notifier';

const REFETCH_INTERVAL = 30 * 1000;
let refetchIntervalId: ReturnType<typeof setInterval> | undefined;

interface State {
    auctionStorage: Record<string, DebtAuctionTransaction>;
    auctionStates: Record<number, DebtAuctionActionStates>;
    areAuctionsFetching: boolean;
    isAuthorizationLoading: boolean;
    error: string | null;
    lastUpdated: Date | undefined;
    auctionErrors: Record<string, string | undefined>;
    tokenAddress: string | undefined;
}

const getInitialState = (): State => ({
    auctionStorage: {},
    auctionStates: {},
    areAuctionsFetching: true,
    isAuthorizationLoading: false,
    error: null,
    lastUpdated: undefined,
    auctionErrors: {},
    tokenAddress: undefined,
});

export const state = (): State => getInitialState();

export const getters = {
    auctions(state: State) {
        return Object.values(state.auctionStorage);
    },
    auctionStates(state: State) {
        return state.auctionStates;
    },
    areAuctionsFetching(state: State) {
        return state.areAuctionsFetching;
    },
    isAuthorizationLoading(state: State) {
        return state.isAuthorizationLoading;
    },
    error(state: State) {
        return state.error;
    },
    lastUpdated(state: State) {
        return state.lastUpdated;
    },
    getAuctionErrors(state: State) {
        return state.auctionErrors;
    },
    getTokenAddress(state: State) {
        return state.tokenAddress;
    },
};

export const mutations = {
    addAuctionsToStorage(state: State, auctions: DebtAuction[]) {
        let auctionIdsToBeModified = Object.values(state.auctionStorage).map(a => a.id);
        // update or create existing auctions
        for (const auction of auctions) {
            Vue.set(state.auctionStorage, auction.id, auction);
            auctionIdsToBeModified = auctionIdsToBeModified.filter(id => id !== auction.id);
        }
        // set others as collected
        for (const collectedAuctionId of auctionIdsToBeModified) {
            Vue.set(state.auctionStorage, collectedAuctionId, {
                id: collectedAuctionId,
                state: 'collected',
                fetchedAt: new Date(),
            });
        }
    },
    addAuctionToStorage(state: State, auction: DebtAuction) {
        Vue.set(state.auctionStorage, auction.id, auction);
    },
    setError(state: State, error: string) {
        state.error = error;
    },
    refreshLastUpdated(state: State) {
        state.lastUpdated = new Date();
    },
    setAuctionsFetching(state: State, areAuctionsFetching: boolean) {
        state.areAuctionsFetching = areAuctionsFetching;
    },
    setAuthorizationLoading(state: State, isLoading: boolean) {
        state.isAuthorizationLoading = isLoading;
    },
    setAuctionState(state: State, { auctionId, value }: { auctionId: number; value: DebtAuctionActionStates }) {
        Vue.set(state.auctionStates, auctionId, value);
    },
    setErrorByAuctionId(state: State, { auctionId, error }: { auctionId: string; error: string }) {
        Vue.set(state.auctionErrors, auctionId, error);
    },
    setTokenAddress(state: State, tokenAddress: string) {
        state.tokenAddress = tokenAddress;
    },
    reset(state: State) {
        Object.assign(state, getInitialState());
    },
};

export const actions = {
    async setup({ dispatch, commit }: ActionContext<State, State>) {
        commit('reset');
        await dispatch('fetchDebtAuctions');
        await dispatch('getDaiTokenAddress');
        await dispatch('authorizations/fetchAllowanceAmount', undefined, { root: true });
        if (refetchIntervalId) {
            clearInterval(refetchIntervalId);
        }
        refetchIntervalId = setInterval(() => dispatch('fetchDebtAuctions'), REFETCH_INTERVAL);
    },
    async getDaiTokenAddress({ commit, rootGetters }: ActionContext<State, State>) {
        const network = rootGetters['network/getMakerNetwork'];
        if (!network) {
            return;
        }
        const tokenAddress = await getTokenAddressByNetworkAndSymbol(network, 'DAI');
        commit('setTokenAddress', tokenAddress);
    },
    async fetchDebtAuctions({ rootGetters, commit }: ActionContext<State, State>) {
        const network = rootGetters['network/getMakerNetwork'];
        if (!network) {
            return;
        }
        try {
            commit('setAuctionsFetching', true);
            const auctions = await fetchActiveDebtAuctions(network);
            const auctionsEnriched = await enrichDebtAuctions(network, auctions);
            commit('addAuctionsToStorage', auctionsEnriched);
        } catch (error: any) {
            console.error('fetch surplus auction error', error);
            commit('setError', error.message);
        } finally {
            commit('setAuctionsFetching', false);
            commit('refreshLastUpdated');
        }
    },
    async restartAuction({ rootGetters, commit, dispatch }: ActionContext<State, State>, auctionIndex: number) {
        const network = rootGetters['network/getMakerNetwork'];
        if (!network) {
            return;
        }
        commit('setAuctionState', { auctionId: auctionIndex, value: 'restarting' });
        try {
            await restartDebtAuction(network, auctionIndex, notifier);
            await dispatch('fetchDebtAuctions');
        } catch (error: any) {
            console.error(`Auction restart error: ${error.message}`);
        } finally {
            commit('setAuctionState', { auctionId: auctionIndex, value: 'loaded' });
        }
    },
    async bidToDebtAuction(
        { rootGetters, commit, dispatch }: ActionContext<State, State>,
        { auctionIndex, desiredMkrAmount }: { auctionIndex: number; desiredMkrAmount: BigNumber }
    ) {
        const network = rootGetters['network/getMakerNetwork'];
        if (!network) {
            return;
        }
        commit('setAuctionState', { auctionId: auctionIndex, value: 'bidding' });
        try {
            await bidToDebtAuction(network, auctionIndex, desiredMkrAmount, notifier);
            await dispatch('fetchDebtAuctions');
        } catch (error: any) {
            console.error(`Failed to bid on auction: ${error.message}`);
        } finally {
            commit('setAuctionState', { auctionId: auctionIndex, value: 'loaded' });
        }
    },
    async collectAuction({ rootGetters, dispatch, commit }: ActionContext<State, State>, auctionIndex: number) {
        const network = rootGetters['network/getMakerNetwork'];
        if (!network) {
            return;
        }
        commit('setAuctionState', { auctionId: auctionIndex, value: 'collecting' });
        try {
            await collectDebtAuction(network, auctionIndex, notifier);
            await dispatch('fetchDebtAuctions');
        } catch (error: any) {
            console.error(`Failed to bid on auction: ${error.message}`);
        } finally {
            commit('setAuctionState', { auctionId: auctionIndex, value: 'loaded' });
        }
    },
};

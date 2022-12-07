import Vue from 'vue';
import type {
    CompensationAuctionActionStates,
    SurplusAuction,
    SurplusAuctionCollected,
    SurplusAuctionTransaction,
} from 'auctions-core/src/types';
import { ActionContext } from 'vuex';
import BigNumber from 'bignumber.js';
import {
    bidToSurplusAuction,
    collectSurplusAuction,
    enrichSurplusAuctions,
    fetchActiveSurplusAuctions,
    restartSurplusAuction,
} from 'auctions-core/src/surplus';
import {
    authorizeSurplus,
    fetchAllowanceAmountMKR,
    getSurplusAuthorizationStatus,
    setAllowanceAmountMKR,
} from 'auctions-core/src/authorizations';
import { getTokenAddressByNetworkAndSymbol } from 'auctions-core/src/tokens';
import { swapToMKR } from 'auctions-core/src/helpers/swap';
import notifier from '~/lib/notifier';

const REFETCH_INTERVAL = 30 * 1000;
let refetchIntervalId: ReturnType<typeof setInterval> | undefined;

const delay = (delay: number) => new Promise(resolve => setTimeout(resolve, delay));
const AUTHORIZATION_STATUS_RETRY_DELAY = 1000;

interface State {
    auctionStorage: Record<string, SurplusAuctionTransaction>;
    auctionStates: Record<number, CompensationAuctionActionStates>;
    areAuctionsFetching: boolean;
    isAuthorizationLoading: boolean;
    error: string | null;
    lastUpdated: Date | undefined;
    allowanceAmount?: BigNumber;
    auctionErrors: Record<string, string | undefined>;
    tokenAddress: string | undefined;
}

const getInitialState = (): State => ({
    auctionStorage: {},
    auctionStates: {},
    allowanceAmount: undefined,
    areAuctionsFetching: true,
    isAuthorizationLoading: false,
    error: null,
    lastUpdated: undefined,
    auctionErrors: {},
    tokenAddress: undefined,
});

export const state = (): State => getInitialState();

export const getters = {
    auctionStorage(state: State) {
        return Object.values(state.auctionStorage);
    },
    auctionStates(state: State) {
        return state.auctionStates;
    },
    allowanceAmount(state: State) {
        return state.allowanceAmount;
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
    addAuctionsToStorage(state: State, auctions: SurplusAuction[]) {
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
            } as SurplusAuctionCollected);
        }
    },
    addAuctionToStorage(state: State, auction: SurplusAuction) {
        Vue.set(state.auctionStorage, auction.id, auction);
    },
    setAllowance(state: State, allowance: BigNumber) {
        state.allowanceAmount = allowance;
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
    setAuctionState(
        state: State,
        { auctionId, value }: { auctionId: number; value: CompensationAuctionActionStates }
    ) {
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
        await dispatch('getMKRTokenAddress');
        await dispatch('fetchSurplusAuctions');
        await dispatch('fetchAllowanceAmount');
        if (refetchIntervalId) {
            clearInterval(refetchIntervalId);
        }
        refetchIntervalId = setInterval(() => dispatch('fetchSurplusAuctions'), REFETCH_INTERVAL);
    },
    async fetchSurplusAuctions({ rootGetters, commit }: ActionContext<State, State>) {
        const network = rootGetters['network/getMakerNetwork'];
        if (!network) {
            return;
        }
        try {
            commit('setAuctionsFetching', true);
            const auctions = await fetchActiveSurplusAuctions(network);
            const auctionsEnriched = await enrichSurplusAuctions(network, auctions);
            commit('addAuctionsToStorage', auctionsEnriched);
        } catch (error: any) {
            console.error('fetch surplus auction error', error);
            commit('setError', error.message);
        } finally {
            commit('setAuctionsFetching', false);
            commit('refreshLastUpdated');
        }
    },
    async fetchAllowanceAmount({ rootGetters, commit }: ActionContext<State, State>) {
        const network = rootGetters['network/getMakerNetwork'];
        const walletAddress = rootGetters['wallet/getAddress'];
        if (!network || !walletAddress) {
            return;
        }
        const allowanceAmount = await fetchAllowanceAmountMKR(network, walletAddress);
        commit('setAllowance', allowanceAmount);
    },
    async setAllowanceAmountMKR({ rootGetters, commit, dispatch }: ActionContext<State, State>, amount: BigNumber) {
        const network = rootGetters['network/getMakerNetwork'];
        const walletAddress = rootGetters['wallet/getAddress'];
        try {
            commit('setAuthorizationLoading', true);
            await setAllowanceAmountMKR(network, walletAddress, amount ? new BigNumber(amount) : undefined, notifier);
            dispatch('fetchAllowanceAmount');
        } catch (error: any) {
            console.error(`Allowance error: ${error.message}`);
        } finally {
            commit('setAuthorizationLoading', false);
        }
    },
    async authorizeSurplusAuctions({ rootGetters, dispatch, commit }: ActionContext<State, State>) {
        const network = rootGetters['network/getMakerNetwork'];
        const walletAddress = rootGetters['wallet/getAddress'];
        commit('setAuthorizationLoading', true);
        try {
            await authorizeSurplus(network, walletAddress, false, notifier);
            await dispatch('fetchSurplusAuthorizationStatus');
        } catch (error: any) {
            console.error(`Wallet authorization error: ${error.message}`);
        } finally {
            commit('setAuthorizationLoading', false);
        }
    },
    async deauthorizeSurplusAuctions({ dispatch, rootGetters, commit }: ActionContext<State, State>) {
        const network = rootGetters['network/getMakerNetwork'];
        const walletAddress = rootGetters['wallet/getAddress'];
        commit('setAuthorizationLoading', true);
        try {
            await authorizeSurplus(network, walletAddress, true, notifier);
            await dispatch('fetchSurplusAuthorizationStatus');
        } catch (error: any) {
            console.error(`Wallet authorization error: ${error.message}`);
        } finally {
            commit('setAuthorizationLoading', false);
        }
    },
    async fetchSurplusAuthorizationStatus({ dispatch, rootGetters, commit }: ActionContext<State, State>) {
        const walletAddress = rootGetters['wallet/getAddress'];
        const network = rootGetters['network/getMakerNetwork'];
        if (!network) {
            return;
        }
        commit('setAuthorizationLoading', true);
        try {
            return await getSurplusAuthorizationStatus(network, walletAddress);
        } catch (error: any) {
            console.error(`Wallet authorization status error: ${error.message}`);
            await delay(AUTHORIZATION_STATUS_RETRY_DELAY);
            await dispatch('fetchSurplusAuthorizationStatus');
        } finally {
            commit('setAuthorizationLoading', false);
        }
    },
    async restartAuction({ rootGetters, commit, dispatch }: ActionContext<State, State>, auctionIndex: number) {
        const network = rootGetters['network/getMakerNetwork'];
        if (!network) {
            return;
        }
        commit('setAuctionState', { auctionId: auctionIndex, value: 'restarting' });
        try {
            await restartSurplusAuction(network, auctionIndex, notifier);
            await dispatch('fetchSurplusAuctions');
        } catch (error: any) {
            console.error(`Auction restart error: ${error.message}`);
        } finally {
            commit('setAuctionState', { auctionId: auctionIndex, value: 'loaded' });
        }
    },
    async bidToSurplusAuction(
        { rootGetters, commit, dispatch }: ActionContext<State, State>,
        { auctionIndex, bid }: { auctionIndex: number; bid: BigNumber }
    ) {
        const network = rootGetters['network/getMakerNetwork'];
        if (!network) {
            return;
        }
        commit('setAuctionState', { auctionId: auctionIndex, value: 'bidding' });
        try {
            await bidToSurplusAuction(network, auctionIndex, bid, notifier);
            await dispatch('fetchSurplusAuctions');
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
            await collectSurplusAuction(network, auctionIndex, notifier);
            await dispatch('fetchSurplusAuctions');
        } catch (error: any) {
            console.error(`Failed to bid on auction: ${error.message}`);
        } finally {
            commit('setAuctionState', { auctionId: auctionIndex, value: 'loaded' });
        }
    },
    async getMKRTokenAddress({ commit, rootGetters }: ActionContext<State, State>) {
        const network = rootGetters['network/getMakerNetwork'];
        if (!network) {
            return;
        }
        const tokenAddress = await getTokenAddressByNetworkAndSymbol(network, 'MKR');
        commit('setTokenAddress', tokenAddress);
    },
    async swapToMKR({ rootGetters }: ActionContext<State, State>) {
        const network = rootGetters['network/getMakerNetwork'];
        if (!network) {
            return;
        }
        await swapToMKR(network, 20, 20, notifier);
    },
};

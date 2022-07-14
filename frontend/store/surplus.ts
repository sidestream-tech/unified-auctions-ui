import Vue from 'vue';
import type { SurplusAuction, SurplusAuctionEnriched } from 'auctions-core/src/types';
import { ActionContext } from 'vuex';
import BigNumber from 'bignumber.js';
import {
    fetchActiveSurplusAuctions,
    restartSurplusAuction,
    bidToSurplusAuction,
    collectSurplusAuction,
    enrichSurplusAuctions,
} from 'auctions-core/src/surplus';
import {
    setAllowanceAmountMKR,
    fetchAllowanceAmountMKR,
    authorizeSurplus,
    getSurplusAuthorizationStatus,
} from 'auctions-core/src/authorizations';
import { getTokenAddressByNetworkAndSymbol } from 'auctions-core/src/tokens';
import notifier from '~/lib/notifier';

const delay = (delay: number) => new Promise(resolve => setTimeout(resolve, delay));
const AUTHORIZATION_STATUS_RETRY_DELAY = 1000;
type AuctionState = 'loaded' | 'restarting' | 'bidding' | 'collecting';
interface State {
    auctionStorage: Record<string, SurplusAuctionEnriched>;
    auctionStates: Record<number, AuctionState>;
    areAuctionsFetching: boolean;
    isAuthorizationLoading: boolean;
    isBidding: boolean;
    error: string | null;
    lastUpdated: Date | undefined;
    allowanceAmount?: BigNumber;
    auctionErrors: Record<string, string | undefined>;
}

const getInitialState = (): State => ({
    auctionStorage: {},
    auctionStates: {},
    allowanceAmount: undefined,
    areAuctionsFetching: false,
    isAuthorizationLoading: false,
    isBidding: false,
    error: null,
    lastUpdated: undefined,
    auctionErrors: {},
});

export const state = (): State => getInitialState();

export const getters = {
    auctionStorage(state: State) {
        return state.auctionStorage;
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
    isBidding(state: State) {
        return state.isBidding;
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
};

export const mutations = {
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
    setAuctionState(state: State, { auctionId, value }: { auctionId: number; value: AuctionState }) {
        Vue.set(state.auctionStates, auctionId, value);
    },
    setErrorByAuctionId(state: State, { auctionId, error }: { auctionId: string; error: string }) {
        Vue.set(state.auctionErrors, auctionId, error);
    },
};

export const actions = {
    async fetchSurplusAuctions({ rootGetters, commit }: ActionContext<State, State>) {
        const network = rootGetters['network/getMakerNetwork'];
        if (!network) {
            return;
        }
        try {
            commit('setAuctionsFetching', true);
            const auctions = await fetchActiveSurplusAuctions(network);
            const auctionsEnriched = await enrichSurplusAuctions(network, auctions);
            auctionsEnriched.forEach(auction => commit('addAuctionToStorage', auction));
        } catch (error: any) {
            console.error('fetch surplus auction error', error);
            commit('setError', error.message);
        } finally {
            commit('setAuctionsFetching', false);
            commit('refreshLastUpdated');
        }
    },
    async setAllowanceAmountMKR({ rootGetters, commit }: ActionContext<State, State>, amount: BigNumber) {
        const network = rootGetters['network/getMakerNetwork'];
        const wallet = rootGetters['wallet/getAddress'];
        try {
            commit('setAuthorizationLoading', true);
            await setAllowanceAmountMKR(network, wallet, new BigNumber(amount), notifier);
            const allowance = await fetchAllowanceAmountMKR(network, wallet);
            commit('setAllowance', allowance);
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
        } catch (error) {
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
        } catch (error) {
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
            const isAuthorized = await getSurplusAuthorizationStatus(network, walletAddress);
            return isAuthorized;
        } catch (error) {
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
            await bidToSurplusAuction(network, auctionIndex, bid);
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
            await collectSurplusAuction(network, auctionIndex);
            await dispatch('fetchSurplusAuctions');
        } catch (error: any) {
            console.error(`Failed to bid on auction: ${error.message}`);
        } finally {
            commit('setAuctionState', { auctionId: auctionIndex, value: 'loaded' });
        }
    },
    async getMKRTokenAddress({ rootGetters }: ActionContext<State, State>) {
        const network = rootGetters['network/getMakerNetwork'];
        if (!network) {
            return;
        }
        return await getTokenAddressByNetworkAndSymbol(network, 'MKR');
    },
};

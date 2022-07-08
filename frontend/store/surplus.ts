import Vue from 'vue';
import type { SurplusAuction } from 'auctions-core/src/types';
import { ActionContext } from 'vuex';
import BigNumber from 'bignumber.js';
import {
    fetchActiveSurplusAuctions,
    restartSurplusAuction,
    bidToSurplusAuction,
    collectSurplusAuction,
} from 'auctions-core/src/surplus';
import {
    setAllowanceAmountMKR,
    fetchAllowanceAmountMKR,
    authorizeSurplus,
    getSurplusAuthorizationStatus,
} from 'auctions-core/src/authorizations';
import notifier from '~/lib/notifier';

const delay = (delay: number) => new Promise(resolve => setTimeout(resolve, delay));
const AUTHORIZATION_STATUS_RETRY_DELAY = 1000;
interface State {
    auctionStorage: Record<string, SurplusAuction>;
    areAuctionsFetching: boolean;
    isAuthorizationLoading: boolean;
    isBidding: boolean;
    error: string | null;
    lastUpdated: Date | undefined;
    allowanceAmount?: BigNumber;
}

const getInitialState = (): State => ({
    auctionStorage: {},
    allowanceAmount: undefined,
    areAuctionsFetching: false,
    isAuthorizationLoading: false,
    isBidding: false,
    error: null,
    lastUpdated: undefined,
});

export const state = (): State => getInitialState();

export const getters = {
    auctionStorage(state: State) {
        return state.auctionStorage;
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
    setIsBidding(state: State, isBidding: boolean) {
        state.isBidding = isBidding;
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
            auctions.forEach(auction => commit('addAuctionToStorage', auction));
        } catch (error: any) {
            console.error('fetch surplus auction error', error);
            commit('setError', error.message);
        } finally {
            commit('setAuctionsFetching', false);
            commit('refreshLastUpdated');
        }
    },
    async giveAllowanceMKR({ rootGetters, commit }: ActionContext<State, State>, amount: number | string) {
        const network = rootGetters['network/getMakerNetwork'];
        const wallet = rootGetters['wallet/getAddress'];
        try {
            commit('setAuthorizationLoading', true);
            await setAllowanceAmountMKR(network, wallet, amount, notifier);
            const allowance = await fetchAllowanceAmountMKR(network, wallet);
            commit('setAllowance', allowance);
        } catch (error: any) {
            console.error(`Allowance error: ${error.message}`);
        } finally {
            commit('setAuthorizationLoading', false);
        }
    },
    async authorizeSurplusAuctions({ rootGetters, dispatch, commit }: ActionContext<State, State>) {
        commit('setAuthorizationLoading', true);
        const network = rootGetters['network/getMakerNetwork'];
        const walletAddress = rootGetters['wallet/getAddress'];
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
        commit('setAuthorizationLoading', true);
        const network = rootGetters['network/getMakerNetwork'];
        const walletAddress = rootGetters['wallet/getAddress'];
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
        commit('setAuthorizationLoading', true);
        const walletAddress = rootGetters['wallet/getAddress'];
        const network = rootGetters['network/getMakerNetwork'];
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
        commit('setAuctionsFetching', true);
        try {
            await restartSurplusAuction(network, auctionIndex, notifier);
            await dispatch('fetchSurplusAuctions');
        } catch (error: any) {
            console.error(`Auction restart error: ${error.message}`);
        } finally {
            commit('setAuctionsFetching', false);
        }
    },
    async betOnAuction(
        { rootGetters, commit, dispatch }: ActionContext<State, State>,
        { auctionIndex, bet }: { auctionIndex: number; bet: string }
    ) {
        const network = rootGetters['network/getMakerNetwork'];
        commit('setIsBidding', true);
        if (!network) {
            return;
        }
        try {
            await bidToSurplusAuction(network, auctionIndex, bet);
            await dispatch('fetchSurplusAuctions');
        } catch (error: any) {
            console.error(`Failed to bid on auction: ${error.message}`);
        } finally {
            commit('setIsBidding', true);
        }
    },
    async collectAuction({ rootGetters, dispatch, commit }: ActionContext<State, State>, auctionIndex: number) {
        const network = rootGetters['network/getMakerNetwork'];
        commit('setIsBidding', true);
        if (!network) {
            return;
        }
        try {
            await collectSurplusAuction(network, auctionIndex);
            await dispatch('fetchSurplusAuctions');
        } catch (error: any) {
            console.error(`Failed to bid on auction: ${error.message}`);
        } finally {
            commit('setIsBidding', true);
        }
    },
};

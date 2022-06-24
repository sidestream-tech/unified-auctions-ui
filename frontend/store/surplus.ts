import Vue from 'vue';
import type { SurplusAuction } from 'auctions-core/src/types';
import { ActionContext } from 'vuex';
import notifier from '~/lib/notifier';
import { fetchActiveSurplusAuctions } from 'auctions-core/src/surplus';
import { setAllowanceAmountSurplus, fetchAllowanceAmountSurplus, authorizeSurplus, getSurplusAuthorizationStatus } from 'auctions-core/src/authorizations';

const delay = (delay: number) => new Promise(resolve => setTimeout(resolve, delay));
const AUTHORIZATION_STATUS_RETRY_DELAY = 1000;

interface State {
    auctionStorage: Record<string, SurplusAuction>;
}

const getInitialState = (): State => ({
    auctionStorage: {},
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
};

export const actions = {
    async fetchSurplusAuctions({ rootGetters, commit }: ActionContext<State, State>) {
        const network = rootGetters['network/getMakerNetwork'];
        const auctions = await fetchActiveSurplusAuctions(network);
        auctions.forEach(auction => commit('addAuctionToStorage', auction));
        return auctions;
    },
    async giveAllowanceMKR( {rootGetters}: ActionContext<State, State>){
        const network = rootGetters['network/getMakerNetwork'];
        const wallet = rootGetters['wallet/getAddress'];
        await setAllowanceAmountSurplus(network, wallet, notifier)
        const allowance = await fetchAllowanceAmountSurplus(network, wallet)
        console.log(allowance.toNumber())
    },
    async authorizeSurplusAuctions({ rootGetters, dispatch }: ActionContext<State, State>) {
        const network = rootGetters['network/getMakerNetwork'];
        const walletAddress = rootGetters['wallet/getAddress'];
        try {
            await authorizeSurplus(network, walletAddress, false, notifier);
            const k = await dispatch('fetchSurplusAuthorizationStatus');
            console.log(k)
        } catch (error) {
            console.error(`Wallet authorization error: ${error.message}`);
        }
    },
    async deauthorizeSurplusAuctions({ commit, dispatch, rootGetters }: ActionContext<State, State>) {
        const network = rootGetters['network/getMakerNetwork'];
        const walletAddress = rootGetters['wallet/getAddress'];
        try {
            await authorizeSurplus(network, walletAddress, true, notifier);
            const k = await dispatch('fetchSurplusAuthorizationStatus');
            console.log(k)
        } catch (error) {
            console.error(`Wallet authorization error: ${error.message}`);
        }
    },
    async fetchSurplusAuthorizationStatus({ commit, dispatch, rootGetters }: ActionContext<State, State>) {
        const walletAddress = rootGetters['wallet/getAddress'];
        const network = rootGetters['network/getMakerNetwork'];
        try {
            const isAuthorized = await getSurplusAuthorizationStatus(network, walletAddress);
            return isAuthorized;
        } catch (error) {
            console.error(`Wallet authorization status error: ${error.message}`);
            await delay(AUTHORIZATION_STATUS_RETRY_DELAY);
            await dispatch('fetchSurplusAuthorizationStatus');
        }
    },
};

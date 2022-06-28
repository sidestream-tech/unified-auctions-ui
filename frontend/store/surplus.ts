import Vue from 'vue';
import type { SurplusAuction } from 'auctions-core/src/types';
import { ActionContext } from 'vuex';
import { fetchActiveSurplusAuctions, restartSurplusAuction, bidToSurplusAuction, collectSurplusAuction , exchangeEthToMkr, approveEthToMkrSwap} from 'auctions-core/src/surplus';
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
        if (!network) {
            return;
        }
        const auctions = await fetchActiveSurplusAuctions(network);
        auctions.forEach(auction => commit('addAuctionToStorage', auction));
        return auctions;
    },
    async giveAllowanceMKR({ rootGetters }: ActionContext<State, State>) {
        const network = rootGetters['network/getMakerNetwork'];
        const wallet = rootGetters['wallet/getAddress'];
        await setAllowanceAmountMKR(network, wallet, notifier);
        const allowance = await fetchAllowanceAmountMKR(network, wallet);
        console.log(allowance.toNumber());
    },
    async authorizeSurplusAuctions({ rootGetters, dispatch }: ActionContext<State, State>) {
        const network = rootGetters['network/getMakerNetwork'];
        const walletAddress = rootGetters['wallet/getAddress'];
        try {
            await authorizeSurplus(network, walletAddress, false, notifier);
            const k = await dispatch('fetchSurplusAuthorizationStatus');
            console.log(k);
        } catch (error) {
            console.error(`Wallet authorization error: ${error.message}`);
        }
    },
    async deauthorizeSurplusAuctions({ dispatch, rootGetters }: ActionContext<State, State>) {
        const network = rootGetters['network/getMakerNetwork'];
        const walletAddress = rootGetters['wallet/getAddress'];
        try {
            await authorizeSurplus(network, walletAddress, true, notifier);
            const k = await dispatch('fetchSurplusAuthorizationStatus');
            console.log(k);
        } catch (error) {
            console.error(`Wallet authorization error: ${error.message}`);
        }
    },
    async fetchSurplusAuthorizationStatus({ dispatch, rootGetters }: ActionContext<State, State>) {
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
    async restartAuction({ rootGetters }: ActionContext<State, State>, auctionIndex: number){
        const network = rootGetters['network/getMakerNetwork'];
        if (!network) {
            return;
        }
        return await restartSurplusAuction(network, auctionIndex, notifier)
    },
    async betOnAuction({ rootGetters }: ActionContext<State, State>, {auctionIndex, bet}:{auctionIndex: number; bet: string}){
        const network = rootGetters['network/getMakerNetwork'];
        if (!network) {
            return;
        }
        console.log(bet)
        bidToSurplusAuction(network, auctionIndex, bet)
    },
    async collectAuction({ rootGetters }: ActionContext<State, State>, auctionIndex: number){
        const network = rootGetters['network/getMakerNetwork'];
        if (!network) {
            return;
        }
        collectSurplusAuction(network, auctionIndex)
    },
    async swapEthToMkr({rootGetters}: ActionContext<State, State>){
        const network = rootGetters['network/getMakerNetwork'];
        if (!network) {
            return;
        }
        const wallet = rootGetters['wallet/getAddress'];
        await exchangeEthToMkr(network, wallet);
    },
    async allowSwapEthToMkr({rootGetters}: ActionContext<State, State>){
        const network = rootGetters['network/getMakerNetwork'];
        if (!network) {
            return;
        }
        await approveEthToMkrSwap(network);
    }
};

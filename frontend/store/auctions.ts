import type { Auction, AuctionTransaction, TakeEvent } from 'auctions-core/src/types';
import Vue from 'vue';
import { ActionContext } from 'vuex';
import { message } from 'ant-design-vue';
import {
    fetchAllAuctions,
    bidWithDai,
    bidWithCallee,
    restartAuction,
    enrichAuctionWithPriceDropAndMarketValue,
    fetchTakeEvents,
} from 'auctions-core/src/auctions';
import { checkAllCalcParameters } from 'auctions-core/src/params';
import { checkAllSupportedCollaterals } from 'auctions-core/src/addresses';
import BigNumber from 'auctions-core/src/bignumber';
import getWallet from '~/lib/wallet';
import notifier from '~/lib/notifier';

const REFETCH_INTERVAL = 30 * 1000;
const TIMER_INTERVAL = 1000;

let refetchIntervalId: ReturnType<typeof setInterval> | undefined;
let updateAuctionsPricesIntervalId: ReturnType<typeof setInterval> | undefined;

interface State {
    auctionStorage: Record<string, AuctionTransaction>;
    takeEventStorage: Record<string, TakeEvent[]>;
    areAuctionsFetching: boolean;
    areTakeEventsFetching: boolean;
    isBidding: boolean;
    error: string | null;
    restartingAuctionsIds: string[];
}

export const state = (): State => ({
    auctionStorage: {},
    takeEventStorage: {},
    areAuctionsFetching: false,
    areTakeEventsFetching: false,
    isBidding: false,
    error: null,
    restartingAuctionsIds: [],
});

export const getters = {
    listAuctions(state: State): AuctionTransaction[] {
        return Object.values(state.auctionStorage);
    },
    listAuctionTransactions(state: State, getters: any, _rootState: any): AuctionTransaction[] {
        const auctions = Object.values(state.auctionStorage);
        return auctions.map(auction => {
            const isRestarting = getters.isAuctionRestarting(auction.id);
            return {
                ...auction,
                isRestarting,
            };
        });
    },
    getTakeEventStorage(state: State): Record<string, TakeEvent[]> {
        return state.takeEventStorage;
    },
    getAuctionById: (state: State) => (id: string) => {
        return state.auctionStorage[id];
    },
    getTakeEventsByAuctionId: (state: State) => (id: string) => {
        return state.takeEventStorage[id];
    },
    getAreAuctionsFetching(state: State) {
        return state.areAuctionsFetching;
    },
    getAreTakeEventsFetching(state: State) {
        return state.areTakeEventsFetching;
    },
    getIsBidding(state: State) {
        return state.isBidding;
    },
    getError(state: State) {
        return state.error;
    },
    isAuctionRestarting: (state: State) => (id: string) => {
        return state.restartingAuctionsIds.includes(id);
    },
};

export const mutations = {
    setAuctions(state: State, auctions: AuctionTransaction[]) {
        const newAuctionStorage = auctions.reduce(
            (auctionStorage: Record<string, AuctionTransaction>, auction: AuctionTransaction) => {
                auctionStorage[auction.id] = auction;
                return auctionStorage;
            },
            {}
        );
        const finishedAuctionIds = Object.keys(state.auctionStorage).filter(auctionID => {
            return !newAuctionStorage[auctionID];
        });
        for (const finishedAuctionId in finishedAuctionIds) {
            state.auctionStorage[finishedAuctionIds[finishedAuctionId]].isFinished = true;
            state.auctionStorage[finishedAuctionIds[finishedAuctionId]].endDate = new Date();
        }
        state.auctionStorage = {
            ...state.auctionStorage,
            ...newAuctionStorage,
        };
    },
    setAuction(state: State, auction: AuctionTransaction) {
        Vue.set(state.auctionStorage, auction.id, auction);
    },
    setTakeEvents(state: State, { id, events }: { id: string; events: TakeEvent[] }) {
        Vue.set(state.takeEventStorage, id, events);
    },
    setAuctionFinish(state: State, { id, transactionAddress }: { id: string; transactionAddress: string }) {
        state.auctionStorage[id].transactionAddress = transactionAddress;
        state.auctionStorage[id].isFinished = true;
        state.auctionStorage[id].endDate = new Date();
    },
    addAuctionRestarting(state: State, id: string) {
        if (!state.restartingAuctionsIds.includes(id)) {
            state.restartingAuctionsIds.push(id);
        }
    },
    removeAuctionRestarting(state: State, id: string) {
        if (state.restartingAuctionsIds.includes(id)) {
            state.restartingAuctionsIds = state.restartingAuctionsIds.filter(auctionId => auctionId !== id);
        }
    },
    setAreAuctionsFetching(state: State, areFetching: boolean) {
        state.areAuctionsFetching = areFetching;
    },
    setAreTakeEventsFetching(state: State, areFetching: boolean) {
        state.areTakeEventsFetching = areFetching;
    },
    setIsBidding(state: State, isBidding: boolean) {
        state.isBidding = isBidding;
    },
    setError(state: State, error: string) {
        state.error = error;
    },
};

export const actions = {
    async fetchWithoutLoading({ commit, rootGetters }: ActionContext<State, State>) {
        const network = rootGetters['network/getMakerNetwork'];
        if (!network) {
            return;
        }
        try {
            const auctions = await fetchAllAuctions(network);
            const active = auctions.filter(auction => auction.isActive);
            active.forEach(auction => {
                commit('removeAuctionRestarting', auction.id);
            });
            commit('setError', null);
            commit('setAuctions', auctions);
        } catch (error) {
            console.error('fetch auction error', error);
            commit('setError', error.message);
        } finally {
            commit('setAreAuctionsFetching', false);
        }
    },
    async fetch({ commit, dispatch }: ActionContext<State, State>) {
        commit('setAreAuctionsFetching', true);
        await dispatch('fetchWithoutLoading');
        if (refetchIntervalId) {
            clearInterval(refetchIntervalId);
        }
        if (updateAuctionsPricesIntervalId) {
            clearInterval(updateAuctionsPricesIntervalId);
        }
        refetchIntervalId = setInterval(() => dispatch('fetchWithoutLoading'), REFETCH_INTERVAL);
        updateAuctionsPricesIntervalId = setInterval(() => dispatch('updateAuctionsPrices'), TIMER_INTERVAL);
    },
    async bidWithCallee(
        { getters, commit, rootGetters }: ActionContext<State, State>,
        { id, alternativeDestinationAddress }: { id: string; alternativeDestinationAddress: string | undefined }
    ) {
        const auction = getters.getAuctionById(id);
        if (!auction) {
            message.error(`Bidding error: can not find auction with id "${id}"`);
            return;
        }
        const network = rootGetters['network/getMakerNetwork'];
        const walletAddress = getWallet().address;
        if (!walletAddress) {
            message.error('Bidding error: can not find wallet');
            return;
        }
        commit('setIsBidding', true);
        try {
            const transactionAddress = await bidWithCallee(
                network,
                auction,
                alternativeDestinationAddress || walletAddress,
                notifier
            );
            commit('setAuctionFinish', { id, transactionAddress });
        } catch (error) {
            console.error('Bidding error', error);
        } finally {
            commit('setIsBidding', false);
        }
    },
    async bidWithDai(
        { getters, commit, dispatch, rootGetters }: ActionContext<State, State>,
        {
            id,
            bidAmountDai,
            alternativeDestinationAddress,
        }: { id: string; bidAmountDai: BigNumber | string; alternativeDestinationAddress: string | undefined }
    ) {
        const auction = getters.getAuctionById(id);
        if (!auction) {
            message.error(`Bidding error: can not find auction with id "${id}"`);
            return;
        }
        const network = rootGetters['network/getMakerNetwork'];
        const walletAddress = getWallet().address;
        if (!walletAddress) {
            message.error('Bidding error: can not find wallet');
            return;
        }
        commit('setIsBidding', true);
        try {
            await bidWithDai(
                network,
                auction,
                new BigNumber(bidAmountDai),
                alternativeDestinationAddress || walletAddress,
                notifier
            );
            await dispatch('wallet/fetchWalletBalances', undefined, { root: true });
            await dispatch('fetch');
        } catch (error) {
            console.error('Bidding error', error);
        } finally {
            commit('setIsBidding', false);
        }
    },
    async restart({ getters, dispatch, commit, rootGetters }: ActionContext<State, State>, id: string) {
        const network = rootGetters['network/getMakerNetwork'];
        const auction = getters.getAuctionById(id);
        if (!auction) {
            message.error(`Auction reset error: can not find auction with id "${id}"`);
            return;
        }
        const walletAddress = getWallet().address;
        if (!walletAddress) {
            message.error('Bidding error: can not find wallet');
            return;
        }
        commit('addAuctionRestarting', id);
        try {
            await restartAuction(network, auction, walletAddress, notifier);
            await dispatch('fetchWithoutLoading');
        } catch (error) {
            commit('removeAuctionRestarting', id);
            console.error(`Auction redo error: ${error.message}`);
        }
    },
    updateAuctionsPrices({ getters, dispatch }: ActionContext<State, State>) {
        const auctions = getters.listAuctions;

        auctions.forEach((auction: Auction) => {
            dispatch('updateAuctionPrice', auction.id);
        });
    },
    async updateAuctionPrice({ getters, commit, rootGetters }: ActionContext<State, State>, id: string) {
        const network = rootGetters['network/getMakerNetwork'];
        const auction = getters.getAuctionById(id);
        try {
            const updatedAuction = await enrichAuctionWithPriceDropAndMarketValue(auction, network);
            commit('setAuction', updatedAuction);
        } catch (error) {
            console.warn(
                `Updating price for ${auction.id} failed with error:`,
                error instanceof Error && error.message
            );
        }
    },
    async checkAllCalcParameters({ rootGetters }: ActionContext<State, State>) {
        const network = rootGetters['network/getMakerNetwork'];
        await checkAllCalcParameters(network);
    },
    async checkAllSupportedCollaterals({ rootGetters }: ActionContext<State, State>) {
        const network = rootGetters['network/getMakerNetwork'];
        await checkAllSupportedCollaterals(network);
    },
    async fetchTakeEventsByAuctionId({ rootGetters, commit }: ActionContext<State, State>, auctionId: string) {
        commit('setAreTakeEventsFetching', true);

        const network = rootGetters['network/getMakerNetwork'];

        try {
            const events = await fetchTakeEvents(network, auctionId);
            commit('setTakeEvents', { id: auctionId, events });
        } catch (error) {
            console.error('fetch take events error', error);
        } finally {
            commit('setAreTakeEventsFetching', false);
        }
    },
};

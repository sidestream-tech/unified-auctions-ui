import type { Auction, AuctionTransaction, TakeEvent } from 'auctions-core/src/types';
import Vue from 'vue';
import { ActionContext } from 'vuex';
import { message } from 'ant-design-vue';
import {
    fetchAllAuctions,
    bidWithDai,
    bidWithCallee,
    restartAuction,
    enrichAuctionWithPriceDropAndMarketDataRecords,
    fetchTakeEvents,
    fetchSingleAuctionById,
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
    isSelectedAuctionFetching: boolean;
    areTakeEventsFetching: boolean;
    isBidding: boolean;
    error: string | null;
    auctionErrors: Record<string, string | undefined>;
    restartingAuctionsIds: string[];
    lastUpdated: Date | undefined;
    auctionAutoRouterStates: Record<string, boolean>;
}

const getInitialState = (): State => ({
    auctionStorage: {},
    takeEventStorage: {},
    areAuctionsFetching: true,
    isSelectedAuctionFetching: false,
    areTakeEventsFetching: false,
    isBidding: false,
    error: null,
    auctionErrors: {},
    restartingAuctionsIds: [],
    lastUpdated: undefined,
    auctionAutoRouterStates: {},
});

export const state = (): State => getInitialState();

export const getters = {
    listAuctionTransactions(state: State, getters: any, _rootState: any, rootGetters: any): AuctionTransaction[] {
        const network = rootGetters['network/getMakerNetwork'];
        const auctions = Object.values(state.auctionStorage).filter(auction => auction.network === network);
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
    getIsSelectedAuctionFetching(state: State) {
        return state.isSelectedAuctionFetching;
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
    getAuctionErrors(state: State) {
        return state.auctionErrors;
    },
    getLastUpdated(state: State) {
        return state.lastUpdated;
    },
    isAuctionRestarting: (state: State) => (id: string) => {
        return state.restartingAuctionsIds.includes(id);
    },
    getAuctionAutoRouterStates: (state: State) => {
        return state.auctionAutoRouterStates;
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
    refreshLastUpdated(state: State) {
        state.lastUpdated = new Date();
    },
    setAreAuctionsFetching(state: State, areFetching: boolean) {
        state.areAuctionsFetching = areFetching;
    },
    setIsSelectedAuctionFetching(state: State, isFetching: boolean) {
        state.isSelectedAuctionFetching = isFetching;
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
    setErrorByAuctionId(state: State, { auctionId, error }: { auctionId: string; error: string }) {
        Vue.set(state.auctionErrors, auctionId, error);
    },
    setAuctionAutoRouterState(state: State, { id, useAutoRouter }: { id: string; useAutoRouter: boolean }) {
        Vue.set(state.auctionAutoRouterStates, id, useAutoRouter);
    },
    reset(state: State) {
        Object.assign(state, getInitialState());
    },
};

export const actions = {
    async update({ rootState, dispatch }: ActionContext<State, any>) {
        const selectedAuctionId = rootState.route.query.auction;
        if (rootState.route.name !== 'collateral') {
            return;
        }
        if (!selectedAuctionId) {
            await dispatch('updateAllAuctions');
        } else {
            await dispatch('updateSingleAuction', selectedAuctionId);
        }
    },
    async updateAllAuctions({ commit, rootGetters }: ActionContext<State, State>) {
        const network = rootGetters['network/getMakerNetwork'];
        if (!network) {
            return;
        }
        commit('setAreAuctionsFetching', true);
        try {
            const auctions = await fetchAllAuctions(network);
            const active = auctions.filter(auction => auction.isActive);
            active.forEach(auction => {
                commit('removeAuctionRestarting', auction.id);
            });
            commit('setError', null);
            commit('setAuctions', auctions);
        } catch (error: any) {
            console.error('fetch auction error', error);
            commit('setError', error.message);
        } finally {
            commit('refreshLastUpdated');
            commit('setAreAuctionsFetching', false);
        }
    },
    async updateSingleAuction({ commit, dispatch, rootGetters }: ActionContext<State, State>, auctionId: string) {
        const network = rootGetters['network/getMakerNetwork'];
        if (!network) {
            return;
        }
        commit('setIsSelectedAuctionFetching', true);
        commit('setAreAuctionsFetching', false);
        try {
            const auction = await fetchSingleAuctionById(network, auctionId);
            commit('setAuction', auction);
            commit('setErrorByAuctionId', { auctionId, error: undefined });
        } catch (error: any) {
            await dispatch('fetchTakeEventsByAuctionId', auctionId);
            console.error('fetch auction error', error);
            commit('setErrorByAuctionId', { auctionId, error: error.message });
        } finally {
            commit('setIsSelectedAuctionFetching', false);
        }
    },
    async fetch({ dispatch }: ActionContext<State, State>) {
        await dispatch('update');
        if (refetchIntervalId) {
            clearInterval(refetchIntervalId);
        }
        if (updateAuctionsPricesIntervalId) {
            clearInterval(updateAuctionsPricesIntervalId);
        }
        refetchIntervalId = setInterval(() => dispatch('update'), REFETCH_INTERVAL);
        updateAuctionsPricesIntervalId = setInterval(
            async () => await dispatch('updateAuctionsPrices'),
            TIMER_INTERVAL
        );
    },
    async bidWithCallee(
        { getters, commit, rootGetters }: ActionContext<State, State>,
        {
            id,
            marketId,
            alternativeDestinationAddress,
        }: { id: string; marketId: string; alternativeDestinationAddress: string | undefined }
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
                marketId,
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
            await dispatch('wallet/fetchCollateralVatBalance', auction.collateralType, { root: true });
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
            await dispatch('update');
        } catch (error: any) {
            commit('removeAuctionRestarting', id);
            console.error(`Auction redo error: ${error.message}`);
        }
    },
    async updateAuctionsPrices({ getters, dispatch }: ActionContext<State, State>) {
        const auctions = getters.listAuctionTransactions;
        if (!auctions) {
            return;
        }

        const promises = auctions.map((auction: Auction) => {
            return dispatch('updateAuctionPrice', auction.id);
        });

        await Promise.all(promises);
    },
    async updateAuctionPrice({ getters, commit, rootGetters }: ActionContext<State, State>, id: string) {
        const network = rootGetters['network/getMakerNetwork'];
        const auction = getters.getAuctionById(id);
        try {
            const useAutoRouter = getters.getAuctionAutoRouterStates[id];
            const updatedAuction = await enrichAuctionWithPriceDropAndMarketDataRecords(
                auction,
                network,
                useAutoRouter
            );
            commit('setAuction', updatedAuction);
        } catch (error: any) {
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
    async setup({ commit, dispatch }: ActionContext<State, State>) {
        commit('reset');

        await dispatch('fetch');
    },
};

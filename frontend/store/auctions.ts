import type { Auction, AuctionTransaction, TransactionFees } from 'auctions-core/src/types';
import { ActionContext } from 'vuex';
import { message } from 'ant-design-vue';
import {
    fetchAllAuctions,
    bidOnTheAuction,
    restartAuction,
    enrichAuctionWithPriceDropAndMarketValue,
} from 'auctions-core/src/auctions';
import { enrichAuctionWithTransactionFees } from 'auctions-core/src/fees';
import { checkAllCalcParameters } from 'auctions-core/src/params';
import { checkAllSupportedCollaterals } from 'auctions-core/src/addresses';
import getWallet from '~/lib/wallet';
import notifier from '~/lib/notifier';

const REFETCH_INTERVAL = 30 * 1000;
const TIMER_INTERVAL = 1000;

let refetchIntervalId: ReturnType<typeof setInterval> | undefined;
let updateAuctionsPricesIntervalId: ReturnType<typeof setInterval> | undefined;

interface State {
    auctionStorage: Record<string, Auction>;
    isFetching: boolean;
    isBidding: boolean;
    error: string | null;
    restartingAuctionsIds: string[];
}

export const state = (): State => ({
    auctionStorage: {},
    isFetching: false,
    isBidding: false,
    error: null,
    restartingAuctionsIds: [],
});

export const getters = {
    listAuctions(state: State) {
        return Object.values(state.auctionStorage);
    },
    listAuctionTransactions(state: State, getters: any, _rootState: any, rootGetters: any): AuctionTransaction[] {
        const fees: TransactionFees = rootGetters['fees/fees'];
        const auctions = Object.values(state.auctionStorage).map(auction =>
            enrichAuctionWithTransactionFees(auction, fees)
        );
        auctions.forEach(auction => {
            auction.isRestarting = getters.isAuctionRestarting(auction.id);
        });
        return auctions;
    },
    getAuctionById: (state: State) => (id: string) => {
        return state.auctionStorage[id];
    },
    getIsFetching(state: State) {
        return state.isFetching;
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
    setAuctions(state: State, auctions: Auction[]) {
        const newAuctionStorage = auctions.reduce((auctionStorage: Record<string, Auction>, auction: Auction) => {
            auctionStorage[auction.id] = auction;
            return auctionStorage;
        }, {});
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
    setAuction(state: State, auction: Auction) {
        state.auctionStorage[auction.id] = auction;
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
    setIsFetching(state: State, isFetching: boolean) {
        state.isFetching = isFetching;
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
            commit('setIsFetching', false);
        }
    },
    async fetch({ commit, dispatch }: ActionContext<State, State>) {
        commit('setIsFetching', true);
        await dispatch('fetchWithoutLoading');
        dispatch('fees/setup', null, { root: true });
        if (refetchIntervalId) {
            clearInterval(refetchIntervalId);
        }
        if (updateAuctionsPricesIntervalId) {
            clearInterval(updateAuctionsPricesIntervalId);
        }
        refetchIntervalId = setInterval(() => dispatch('fetchWithoutLoading'), REFETCH_INTERVAL);
        updateAuctionsPricesIntervalId = setInterval(() => dispatch('updateAuctionsPrices'), TIMER_INTERVAL);
    },
    async bid(
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
            const transactionAddress = await bidOnTheAuction(
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
};

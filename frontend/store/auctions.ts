import { ActionContext } from 'vuex';
import { message } from 'ant-design-vue';
import { fetchAllAuctions, bidOnTheAuction, restartAuction } from '~/../core/src/auctions';
import { checkAllExchangeRates } from '~/../core/src/uniswap';
import { enrichAuctionWithTransactionFees } from '~/../core/src/fees';
import { checkAllCalcParameters } from '~/../core/src/params';
import getWallet from '~/lib/wallet';
import notifier from '~/lib/notifier';

const REFETCH_INTERVAL = 30 * 1000;
let refetchIntervalId: ReturnType<typeof setInterval> | undefined;

interface State {
    auctionStorage: Record<string, Auction>;
    isFetching: boolean;
    isBidding: boolean;
    error: string | null;
}

export const state = (): State => ({
    auctionStorage: {},
    isFetching: false,
    isBidding: false,
    error: null,
});

export const getters = {
    listAuctions(state: State) {
        return Object.values(state.auctionStorage);
    },
    listAuctionTransactions(state: State, _getters: any, _rootState: any, rootGetters: any): AuctionTransaction[] {
        const fees: TransactionFees = rootGetters['fees/fees'];
        return Object.values(state.auctionStorage).map(auction => enrichAuctionWithTransactionFees(auction, fees));
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
            state.auctionStorage[finishedAuctionIds[finishedAuctionId]].till = new Date().toISOString();
        }
        state.auctionStorage = {
            ...state.auctionStorage,
            ...newAuctionStorage,
        };
    },
    setAuctionFinish(state: State, { id, transactionAddress }: { id: string; transactionAddress: string }) {
        state.auctionStorage[id].transactionAddress = transactionAddress;
        state.auctionStorage[id].isFinished = true;
        state.auctionStorage[id].till = new Date().toISOString();
    },
    setAuctionRestarting(state: State, { id, isRestarting }: { id: string; isRestarting: boolean }) {
        state.auctionStorage[id].isRestarting = isRestarting;
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
        refetchIntervalId = setInterval(() => dispatch('fetchWithoutLoading'), REFETCH_INTERVAL);
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
    async restart({ getters, dispatch, commit }: ActionContext<State, State>, id: string) {
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
        commit('setAuctionRestarting', { id, isRestarting: true });
        try {
            await restartAuction(auction.collateralType, auction.auctionId, walletAddress);
            await dispatch('fetchWithoutLoading');
        } catch (error) {
            commit('setAuctionRestarting', { id, isRestarting: false });
            console.error(`Auction redo error: ${error.message}`);
        }
    },
    async checkAllExchangeRates({ rootGetters }: ActionContext<State, State>) {
        const network = rootGetters['network/getMakerNetwork'];
        await checkAllExchangeRates(network);
    },
    async checkAllCalcParameters({ rootGetters }: ActionContext<State, State>) {
        const network = rootGetters['network/getMakerNetwork'];
        await checkAllCalcParameters(network);
    },
};

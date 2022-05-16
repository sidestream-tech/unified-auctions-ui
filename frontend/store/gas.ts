import { ActionContext } from 'vuex';
import type { GasParameters, TransactionFees } from 'auctions-core/src/types';
import { getBaseFeePerGas, getGasParametersForTransaction } from 'auctions-core/src/gas';
import BigNumber from 'bignumber.js';
import { getApproximateTransactionFees } from 'auctions-core/src/fees';
import { GWEI_NUMBER_OF_DIGITS } from 'auctions-core/src/constants/UNITS';

const REFETCH_INTERVAL = 30 * 1000;
let refetchIntervalId: ReturnType<typeof setInterval> | undefined;

interface State {
    baseFeePerGas: BigNumber | undefined;
    gasParameters: GasParameters;
    transactionFees: TransactionFees | undefined;
}

const getInitialState = (): State => ({
    baseFeePerGas: undefined,
    gasParameters: {
        maxFeePerGas: undefined,
        maxPriorityFeePerGas: undefined,
        gasPrice: undefined,
    },
    transactionFees: undefined,
});

export const state = (): State => getInitialState();

export const getters = {
    getBaseFeePerGas(state: State) {
        return state.baseFeePerGas;
    },
    getGasParameters(state: State) {
        return state.gasParameters;
    },
    getTransactionFees(state: State) {
        return state.transactionFees;
    },
};

export const mutations = {
    setBaseFeePerGas(state: State, baseFeePerGas: BigNumber) {
        state.baseFeePerGas = baseFeePerGas;
    },
    setGasParameters(state: State, gasParameters: GasParameters) {
        state.gasParameters = {
            ...state.gasParameters,
            ...gasParameters,
        };
    },
    setTransactionFees(state: State, transactionFees: TransactionFees) {
        state.transactionFees = transactionFees;
    },
    reset(state: State) {
        Object.assign(state, getInitialState());
    },
};

export const actions = {
    async fetchBaseFeePerGas({ commit, rootGetters }: ActionContext<State, State>) {
        const network = rootGetters['network/getMakerNetwork'];
        if (!network) {
            return;
        }
        const baseFeePerGas = await getBaseFeePerGas(network);
        commit('setBaseFeePerGas', baseFeePerGas.shiftedBy(GWEI_NUMBER_OF_DIGITS));
    },
    async fetchGasParameters({ commit, rootGetters }: ActionContext<State, State>) {
        const network = rootGetters['network/getMakerNetwork'];
        if (!network) {
            return;
        }
        const gasParameters = await getGasParametersForTransaction(network);
        commit('setGasParameters', gasParameters);
    },
    async fetchTransactionFees({ commit, rootGetters }: ActionContext<State, State>) {
        const network = rootGetters['network/getMakerNetwork'];
        if (!network) {
            return;
        }
        const transactionFees = await getApproximateTransactionFees(network);
        commit('setTransactionFees', transactionFees);
    },
    async setup({ commit, dispatch }: ActionContext<State, State>) {
        commit('reset');

        await dispatch('fetchBaseFeePerGas');
        await dispatch('fetchGasParameters');
        await dispatch('fetchTransactionFees');

        if (refetchIntervalId) {
            clearInterval(refetchIntervalId);
        }
        refetchIntervalId = setInterval(async () => {
            await dispatch('fetchBaseFeePerGas');
            await dispatch('fetchGasParameters');
            await dispatch('fetchTransactionFees');
        }, REFETCH_INTERVAL);
    },
};

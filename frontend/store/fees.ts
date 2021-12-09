import { ActionContext } from 'vuex';
import { getApproximateTransactionFees } from '~/../core/src/fees';

const REFETCH_INTERVAL = 30 * 1000;
let refetchIntervalId: ReturnType<typeof setInterval> | undefined;

interface State {
    fees?: TransactionFees;
}

export const state = (): State => ({
    fees: undefined,
});

export const getters = {
    fees(state: State) {
        return state.fees || {};
    },
};

export const mutations = {
    setFees(state: State, fees: TransactionFees) {
        state.fees = { ...fees };
    },
};

export const actions = {
    async fetch({ commit, rootGetters }: ActionContext<State, State>) {
        const network = rootGetters['preferences/getNetwork'];
        if (!network) {
            return;
        }
        const fees = await getApproximateTransactionFees(network);
        commit('setFees', fees);
    },
    async setup({ dispatch }: ActionContext<State, State>) {
        await dispatch('fetch');
        if (refetchIntervalId) {
            clearInterval(refetchIntervalId);
        }
        refetchIntervalId = setInterval(() => dispatch('fetch'), REFETCH_INTERVAL);
    },
};

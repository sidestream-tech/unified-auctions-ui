import { ActionContext } from 'vuex';
import BigNumber from 'bignumber.js';
import {
    getWalletAuthorizationStatus,
    authorizeWallet,
    getCollateralAuthorizationStatus,
    authorizeCollateral,
    setAllowanceAmount,
    fetchAllowanceAmount,
} from 'auctions-core/src/authorizations';
import notifier from '~/lib/notifier';

const AUTHORIZATION_STATUS_RETRY_DELAY = 1000;

interface State {
    isWalletAuthorizationLoading: boolean;
    isWalletAuthorizationDone: boolean;
    isCollateralAuthorizationLoading: boolean;
    collateralAuthorizations: string[];
    isAllowanceAmountLoading: boolean;
    allowanceAmount?: BigNumber;
}

const getInitialState = (): State => ({
    isWalletAuthorizationLoading: false,
    isWalletAuthorizationDone: false,
    isCollateralAuthorizationLoading: false,
    collateralAuthorizations: [],
    isAllowanceAmountLoading: false,
    allowanceAmount: undefined,
});

export const state = () => getInitialState();

export const getters = {
    isAuthorizationLoading(state: State) {
        return state.isWalletAuthorizationLoading || state.isCollateralAuthorizationLoading;
    },
    isWalletAuthorizationDone(state: State) {
        return state.isWalletAuthorizationDone;
    },
    collateralAuthorizations(state: State) {
        return state.collateralAuthorizations;
    },
    allowanceAmount(state: State) {
        return state.allowanceAmount ?? new BigNumber(0);
    },
};

export const mutations = {
    setIsWalletAuthorizationDone(state: State, isAuthorized: boolean) {
        state.isWalletAuthorizationDone = isAuthorized;
    },
    setIsWalletAuthorizationLoading(state: State, isLoading: boolean) {
        state.isWalletAuthorizationLoading = isLoading;
    },
    setIsCollateralAuthorizationLoading(state: State, isLoading: boolean) {
        state.isCollateralAuthorizationLoading = isLoading;
    },
    setIsAllowanceAmountLoading(state: State, isAllowanceAmountLoading: boolean) {
        state.isAllowanceAmountLoading = isAllowanceAmountLoading;
    },
    setAllowanceAmount(state: State, allowanceAmount: BigNumber) {
        state.allowanceAmount = allowanceAmount;
    },
    addCollateralAuthorization(state: State, collateralType: string) {
        if (!state.collateralAuthorizations.includes(collateralType)) {
            state.collateralAuthorizations.push(collateralType);
        }
    },
    removeCollateralAuthorization(state: State, collateralType: string) {
        if (state.collateralAuthorizations.includes(collateralType)) {
            state.collateralAuthorizations = state.collateralAuthorizations.filter(c => c !== collateralType);
        }
    },
    reset(state: State) {
        Object.assign(state, getInitialState());
    },
};

export const actions = {
    reset({ commit }: ActionContext<State, State>) {
        commit('reset');
    },
    async refetch({ dispatch }: ActionContext<State, State>) {
        await dispatch('fetchWalletAuthorizationStatus');
        const auctionParam = window?.$nuxt?.$route?.query?.auction;
        const auctionId = Array.isArray(auctionParam) ? auctionParam[0] : auctionParam;
        const collateralType = auctionId ? auctionId.split(':')[0] : '';
        if (collateralType) {
            await dispatch('fetchCollateralAuthorizationStatus', collateralType);
        }
    },
    async fetchWalletAuthorizationStatus({ commit, dispatch, rootGetters }: ActionContext<State, State>) {
        const walletAddress = rootGetters['wallet/getAddress'];
        const network = rootGetters['network/getMakerNetwork'];
        if (!walletAddress) {
            commit('setIsWalletAuthorizationDone', false);
            return;
        }
        commit('setIsWalletAuthorizationLoading', true);
        try {
            const isAuthorized = await getWalletAuthorizationStatus(network, walletAddress);
            commit('setIsWalletAuthorizationDone', isAuthorized);
            return isAuthorized;
        } catch (error) {
            commit('setIsWalletAuthorizationDone', false);
            console.error(`Wallet authorization status error: ${error.message}`);
            setTimeout(() => dispatch('fetchWalletAuthorizationStatus'), AUTHORIZATION_STATUS_RETRY_DELAY);
        } finally {
            commit('setIsWalletAuthorizationLoading', false);
        }
    },
    async authorizeWallet({ commit, dispatch, rootGetters }: ActionContext<State, State>) {
        commit('setIsWalletAuthorizationLoading', true);
        const network = rootGetters['network/getMakerNetwork'];
        try {
            await authorizeWallet(network, false, notifier);
            dispatch('fetchWalletAuthorizationStatus');
        } catch (error) {
            console.error(`Wallet authorization error: ${error.message}`);
        } finally {
            commit('setIsWalletAuthorizationLoading', false);
        }
    },
    async deauthorizeWallet({ commit, dispatch, rootGetters }: ActionContext<State, State>) {
        commit('setIsWalletAuthorizationLoading', true);
        const network = rootGetters['network/getMakerNetwork'];
        try {
            await authorizeWallet(network, true, notifier);
            dispatch('fetchWalletAuthorizationStatus');
        } catch (error) {
            console.error(`Wallet authorization error: ${error.message}`);
        } finally {
            commit('setIsWalletAuthorizationLoading', false);
        }
    },
    async fetchCollateralAuthorizationStatus(
        { commit, dispatch, rootGetters }: ActionContext<State, State>,
        collateralType: string
    ) {
        const walletAddress = rootGetters['wallet/getAddress'];
        const network = rootGetters['network/getMakerNetwork'];
        if (!walletAddress) {
            commit('setIsWalletAuthorizationDone', false);
            return;
        }
        commit('setIsCollateralAuthorizationLoading', true);
        try {
            const isAuthorized = await getCollateralAuthorizationStatus(network, collateralType, walletAddress);
            if (isAuthorized) {
                commit('addCollateralAuthorization', collateralType);
            } else {
                commit('removeCollateralAuthorization', collateralType);
            }
            return isAuthorized;
        } catch (error) {
            console.error(`Collateral authorization status error: ${error.message}`);
            setTimeout(
                () => dispatch('fetchCollateralAuthorizationStatus', collateralType),
                AUTHORIZATION_STATUS_RETRY_DELAY
            );
        } finally {
            commit('setIsCollateralAuthorizationLoading', false);
        }
    },
    async authorizeCollateral({ commit, dispatch, rootGetters }: ActionContext<State, State>, collateralType: string) {
        commit('setIsCollateralAuthorizationLoading', true);
        const network = rootGetters['network/getMakerNetwork'];
        try {
            await authorizeCollateral(network, collateralType, false, notifier);
            dispatch('fetchCollateralAuthorizationStatus', collateralType);
        } catch (error) {
            console.error(`Collateral authorization error: ${error.message}`);
        } finally {
            commit('setIsCollateralAuthorizationLoading', false);
        }
    },
    async deauthorizeCollateral(
        { commit, dispatch, rootGetters }: ActionContext<State, State>,
        collateralType: string
    ) {
        commit('setIsCollateralAuthorizationLoading', true);
        const network = rootGetters['network/getMakerNetwork'];
        try {
            await authorizeCollateral(network, collateralType, true, notifier);
            dispatch('fetchCollateralAuthorizationStatus', collateralType);
        } catch (error) {
            console.error(`Collateral authorization error: ${error.message}`);
        } finally {
            commit('setIsCollateralAuthorizationLoading', false);
        }
    },
    async setAllowanceAmount({ commit, rootGetters }: ActionContext<State, State>, amount?: BigNumber | string) {
        commit('setIsAllowanceAmountLoading', true);
        const network = rootGetters['network/getMakerNetwork'];
        try {
            await setAllowanceAmount(network, amount, notifier);
        } catch (error) {
            console.error(`Setting allowance amount error: ${error.message}`);
        } finally {
            commit('setIsAllowanceAmountLoading', false);
        }
    },
    async fetchAllowanceAmount({ commit, dispatch, rootGetters }: ActionContext<State, State>) {
        commit('setIsAllowanceAmountLoading', true);
        const network = rootGetters['network/getMakerNetwork'];
        const walletAddress = rootGetters['wallet/getAddress'];
        try {
            const allowanceAmount = await fetchAllowanceAmount(network, walletAddress);
            commit('setAllowanceAmount', allowanceAmount);
        } catch (error) {
            console.error(`Fetching allowance amount error: ${error.message}`);
            setTimeout(() => dispatch('fetchAllowanceAmount'), AUTHORIZATION_STATUS_RETRY_DELAY);
        } finally {
            commit('setIsAllowanceAmountLoading', false);
        }
    },
};

import { ActionContext } from 'vuex';
import BigNumber from 'bignumber.js';
import {
    getWalletAuthorizationStatus,
    authorizeWallet,
    getCollateralAuthorizationStatus,
    authorizeCollateral,
    authorizeDebtAuction,
    setAllowanceAmountDAI,
    fetchAllowanceAmountDAI,
    getDebtAuctionAuthorizationStatus,
} from 'auctions-core/src/authorizations';
import notifier from '~/lib/notifier';

const delay = (delay: number) => new Promise(resolve => setTimeout(resolve, delay));
const AUTHORIZATION_STATUS_RETRY_DELAY = 1000;

interface State {
    isWalletAuthorizationLoading: boolean;
    isWalletAuthorizationDone: boolean;
    authorizingCollaterals: string[];
    collateralAuthorizations: string[];
    isAllowanceAmountLoading: boolean;
    allowanceAmount?: BigNumber;
    isDebtAuctionAuthorizationDone: boolean;
    isDebtAuctionAuthorizationLoading: boolean;
}

const getInitialState = (): State => ({
    isWalletAuthorizationLoading: false,
    isWalletAuthorizationDone: false,
    authorizingCollaterals: [],
    collateralAuthorizations: [],
    isAllowanceAmountLoading: false,
    allowanceAmount: undefined,
    isDebtAuctionAuthorizationDone: false,
    isDebtAuctionAuthorizationLoading: false,
});

export const state = () => getInitialState();

export const getters = {
    isAuthorizationLoading(state: State) {
        return state.authorizingCollaterals.length > 0;
    },
    authorizingCollaterals(state: State) {
        return state.authorizingCollaterals;
    },
    isWalletAuthorizationLoading(state: State) {
        return state.isWalletAuthorizationLoading;
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
    isAllowanceAmountLoading(state: State) {
        return state.isAllowanceAmountLoading;
    },
    isDebtAuctionAuthorizationDone(state: State) {
        return state.isDebtAuctionAuthorizationDone;
    },
    isDebtAuctionAuthorizationLoading(state: State) {
        return state.isDebtAuctionAuthorizationLoading;
    },
};

export const mutations = {
    setIsWalletAuthorizationDone(state: State, isAuthorized: boolean) {
        state.isWalletAuthorizationDone = isAuthorized;
    },
    setIsWalletAuthorizationLoading(state: State, isLoading: boolean) {
        state.isWalletAuthorizationLoading = isLoading;
    },
    setIsCollateralAuthorizationLoading(
        state: State,
        { collateralType, isLoading }: { collateralType: string; isLoading: boolean }
    ) {
        if (isLoading) {
            state.authorizingCollaterals.push(collateralType);
        } else {
            state.authorizingCollaterals = state.authorizingCollaterals.filter(c => c !== collateralType);
        }
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
    setIsDebtAuctionAuthorizationDone(state: State, isDone: boolean) {
        state.isDebtAuctionAuthorizationDone = isDone;
    },
    setIsDebtAuctionAuthorizationLoading(state: State, isLoading: boolean) {
        state.isDebtAuctionAuthorizationLoading = isLoading;
    },
};

export const actions = {
    reset({ commit }: ActionContext<State, State>) {
        commit('reset');
    },
    async setup({ dispatch, rootState }: ActionContext<State, any>) {
        dispatch('reset');
        if (
            rootState.route.name !== 'collateral' &&
            rootState.route.name !== 'surplus' &&
            rootState.route.name !== 'debt' &&
            rootState.route.name !== 'vaults'
        ) {
            return;
        }
        await dispatch('refetch');
    },
    async refetch({ dispatch, rootState }: ActionContext<State, any>) {
        await dispatch('fetchWalletAuthorizationStatus');
        await dispatch('fetchDebtAuctionAuthorizationStatus');
        await dispatch('fetchAllowanceAmount');
        const auctionParam = window?.$nuxt?.$route?.query?.auction;
        const isCollateral = rootState.route.name === 'collateral';

        const auctionId = Array.isArray(auctionParam) ? auctionParam[0] : auctionParam;
        const collateralType = auctionId && isCollateral ? auctionId.split(':')[0] : '';
        if (collateralType) {
            await dispatch('fetchCollateralAuthorizationStatus', collateralType);
        }
    },
    async fetchWalletAuthorizationStatus({ commit, dispatch, rootGetters }: ActionContext<State, State>) {
        const walletAddress = rootGetters['wallet/getAddress'];
        const network = rootGetters['network/getMakerNetwork'];
        if (!walletAddress || !network) {
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
            await delay(AUTHORIZATION_STATUS_RETRY_DELAY);
            await dispatch('fetchWalletAuthorizationStatus');
        } finally {
            commit('setIsWalletAuthorizationLoading', false);
        }
    },
    async fetchDebtAuctionAuthorizationStatus({ commit, dispatch, rootGetters }: ActionContext<State, State>) {
        const walletAddress = rootGetters['wallet/getAddress'];
        const network = rootGetters['network/getMakerNetwork'];
        if (!walletAddress || !network) {
            commit('setIsDebtAuctionAuthorizationDone', false);
            return;
        }
        commit('setIsDebtAuctionAuthorizationLoading', true);
        try {
            const isAuthorized = await getDebtAuctionAuthorizationStatus(network, walletAddress);
            commit('setIsDebtAuctionAuthorizationDone', isAuthorized);
            return isAuthorized;
        } catch (error) {
            commit('setIsDebtAuctionAuthorizationDone', false);
            console.error(`Wallet authorization status error: ${error.message}`);
            await delay(AUTHORIZATION_STATUS_RETRY_DELAY);
            await dispatch('fetchDebtAuctionAuthorizationStatus');
        } finally {
            commit('setIsDebtAuctionAuthorizationLoading', false);
        }
    },

    async authorizeWallet({ commit, dispatch, rootGetters }: ActionContext<State, State>) {
        commit('setIsWalletAuthorizationLoading', true);
        const network = rootGetters['network/getMakerNetwork'];
        const walletAddress = rootGetters['wallet/getAddress'];
        try {
            await authorizeWallet(network, walletAddress, false, notifier);
            await dispatch('fetchWalletAuthorizationStatus');
        } catch (error) {
            console.error(`Wallet authorization error: ${error.message}`);
        } finally {
            commit('setIsWalletAuthorizationLoading', false);
        }
    },
    async deauthorizeWallet({ commit, dispatch, rootGetters }: ActionContext<State, State>) {
        commit('setIsWalletAuthorizationLoading', true);
        const network = rootGetters['network/getMakerNetwork'];
        const walletAddress = rootGetters['wallet/getAddress'];
        try {
            await authorizeWallet(network, walletAddress, true, notifier);
            await dispatch('fetchWalletAuthorizationStatus');
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
        if (!walletAddress || !network) {
            commit('setIsWalletAuthorizationDone', false);
            return;
        }
        commit('setIsCollateralAuthorizationLoading', { collateralType, isLoading: true });
        try {
            const isAuthorized = await getCollateralAuthorizationStatus(network, collateralType, walletAddress);
            if (isAuthorized) {
                commit('addCollateralAuthorization', collateralType);
            } else {
                commit('removeCollateralAuthorization', collateralType);
            }
            return isAuthorized;
        } catch (error) {
            console.error(`Collateral ${collateralType} authorization status error: ${error.message}`);
            await delay(AUTHORIZATION_STATUS_RETRY_DELAY);
            await dispatch('fetchCollateralAuthorizationStatus', collateralType);
        } finally {
            commit('setIsCollateralAuthorizationLoading', { collateralType, isLoading: false });
        }
    },
    async authorizeDebtAuctionContract({ commit, dispatch, rootGetters }: ActionContext<State, State>) {
        commit('setIsDebtAuctionAuthorizationLoading', true);
        const network = rootGetters['network/getMakerNetwork'];
        const walletAddress = rootGetters['wallet/getAddress'];
        try {
            await authorizeDebtAuction(network, walletAddress, false, notifier);
            await dispatch('fetchDebtAuctionAuthorizationStatus');
        } catch (error) {
            console.error(`Debt auction authorization error: ${error.message}`);
        } finally {
            commit('setIsDebtAuctionAuthorizationLoading', false);
        }
    },
    async authorizeCollateral({ commit, dispatch, rootGetters }: ActionContext<State, State>, collateralType: string) {
        commit('setIsCollateralAuthorizationLoading', { collateralType, isLoading: true });
        const network = rootGetters['network/getMakerNetwork'];
        const walletAddress = rootGetters['wallet/getAddress'];
        try {
            await authorizeCollateral(network, walletAddress, collateralType, false, notifier);
            await dispatch('fetchCollateralAuthorizationStatus', collateralType);
        } catch (error) {
            console.error(`Collateral authorization error: ${error.message}`);
        } finally {
            commit('setIsCollateralAuthorizationLoading', { collateralType, isLoading: false });
        }
    },
    async deauthorizeCollateral(
        { commit, dispatch, rootGetters }: ActionContext<State, State>,
        collateralType: string
    ) {
        commit('setIsCollateralAuthorizationLoading', { collateralType, isLoading: true });
        const network = rootGetters['network/getMakerNetwork'];
        const walletAddress = rootGetters['wallet/getAddress'];
        try {
            await authorizeCollateral(network, walletAddress, collateralType, true, notifier);
            await dispatch('fetchCollateralAuthorizationStatus', collateralType);
        } catch (error) {
            console.error(`Collateral authorization error: ${error.message}`);
        } finally {
            commit('setIsCollateralAuthorizationLoading', { collateralType, isLoading: false });
        }
    },
    async setAllowanceAmount(
        { commit, dispatch, rootGetters }: ActionContext<State, State>,
        amount?: BigNumber | string
    ) {
        commit('setIsAllowanceAmountLoading', true);
        const network = rootGetters['network/getMakerNetwork'];
        const walletAddress = rootGetters['wallet/getAddress'];
        try {
            await setAllowanceAmountDAI(network, walletAddress, amount, notifier);
            await dispatch('fetchAllowanceAmount');
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
        if (!walletAddress || !network) {
            commit('setAllowanceAmount', undefined);
            return;
        }
        try {
            const allowanceAmount = await fetchAllowanceAmountDAI(network, walletAddress);
            commit('setAllowanceAmount', allowanceAmount);
        } catch (error) {
            console.error(`Fetching allowance amount error: ${error.message}`);
            await delay(AUTHORIZATION_STATUS_RETRY_DELAY);
            await dispatch('fetchAllowanceAmount');
        } finally {
            commit('setIsAllowanceAmountLoading', false);
        }
    },
};

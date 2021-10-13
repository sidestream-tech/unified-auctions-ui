import { message } from 'ant-design-vue';
import { ActionContext } from 'vuex';
import {
    getWalletAuthorizationStatus,
    authorizeWallet,
    getCollateralAuthorizationStatus,
    authorizeCollateral,
} from '~/lib/authorizations';

interface State {
    isWalletAuthorizationLoading: boolean;
    isWalletAuthorizationDone: boolean;
    isCollateralAuthorizationLoading: boolean;
    collateralAuthorizations: string[];
}

const getInitialState = (): State => ({
    isWalletAuthorizationLoading: false,
    isWalletAuthorizationDone: false,
    isCollateralAuthorizationLoading: false,
    collateralAuthorizations: [],
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
    async fetchWalletAuthorizationStatus({ commit, rootGetters }: ActionContext<State, State>) {
        if (!rootGetters['wallet/isConnected']) {
            commit('setIsWalletAuthorizationDone', false);
            return;
        }
        commit('setIsWalletAuthorizationLoading', true);
        try {
            const isAuthorized = await getWalletAuthorizationStatus();
            commit('setIsWalletAuthorizationDone', isAuthorized);
            return isAuthorized;
        } catch (error) {
            commit('setIsWalletAuthorizationDone', false);
            message.error(`Wallet authorization status error: ${error.message}`);
        } finally {
            commit('setIsWalletAuthorizationLoading', false);
        }
    },
    async authorizeWallet({ commit, dispatch }: ActionContext<State, State>) {
        commit('setIsWalletAuthorizationLoading', true);
        try {
            await authorizeWallet();
            dispatch('fetchWalletAuthorizationStatus');
        } catch (error) {
            console.error(`Wallet authorization error: ${error.message}`);
        } finally {
            commit('setIsWalletAuthorizationLoading', false);
        }
    },
    async deauthorizeWallet({ commit, dispatch }: ActionContext<State, State>) {
        commit('setIsWalletAuthorizationLoading', true);
        try {
            await authorizeWallet(true);
            dispatch('fetchWalletAuthorizationStatus');
        } catch (error) {
            console.error(`Wallet authorization error: ${error.message}`);
        } finally {
            commit('setIsWalletAuthorizationLoading', false);
        }
    },
    async fetchCollateralAuthorizationStatus(
        { commit, rootGetters }: ActionContext<State, State>,
        collateralType: string
    ) {
        const isWalletConnected = rootGetters['wallet/isConnected'];
        if (!isWalletConnected) {
            commit('setIsWalletAuthorizationDone', false);
            return;
        }
        commit('setIsCollateralAuthorizationLoading', true);
        try {
            const isAuthorized = await getCollateralAuthorizationStatus(collateralType);
            if (isAuthorized) {
                commit('addCollateralAuthorization', collateralType);
            } else {
                commit('removeCollateralAuthorization', collateralType);
            }
            return isAuthorized;
        } catch (error) {
            message.error(`Collateral authorization status error: ${error.message}`);
        } finally {
            commit('setIsCollateralAuthorizationLoading', false);
        }
    },
    async authorizeCollateral({ commit, dispatch }: ActionContext<State, State>, collateralType: string) {
        commit('setIsCollateralAuthorizationLoading', true);
        try {
            await authorizeCollateral(collateralType);
            dispatch('fetchCollateralAuthorizationStatus', collateralType);
        } catch (error) {
            console.error(`Collateral authorization error: ${error.message}`);
        } finally {
            commit('setIsCollateralAuthorizationLoading', false);
        }
    },
    async deauthorizeCollateral({ commit, dispatch }: ActionContext<State, State>, collateralType: string) {
        commit('setIsCollateralAuthorizationLoading', true);
        try {
            await authorizeCollateral(collateralType, true);
            dispatch('fetchCollateralAuthorizationStatus', collateralType);
        } catch (error) {
            console.error(`Collateral authorization error: ${error.message}`);
        } finally {
            commit('setIsCollateralAuthorizationLoading', false);
        }
    },
};

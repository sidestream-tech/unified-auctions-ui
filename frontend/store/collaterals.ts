import Vue from 'vue';
import { ActionContext } from 'vuex';
import type { CollateralRow, CollateralStatus } from 'auctions-core/src/types';
import COLLATERALS, {
    getAllCollateralTypes,
    getCollateralConfigByType,
} from 'auctions-core/src/constants/COLLATERALS';
import { getMarketPrice } from 'auctions-core/src/calleeFunctions';
import { fetchCalcParametersByCollateralType } from 'auctions-core/src/params';
import { getTokenAddressByNetworkAndSymbol } from 'auctions-core/src/tokens';
import { isCollateralTypeSupported } from 'auctions-core/src/addresses';
import { fetchAutoRouteInformation } from 'auctions-core/src/calleeFunctions/helpers/uniswapAutoRouter';

interface State {
    collaterals: CollateralRow[];
    collateralStatusesStorage: Record<string, CollateralStatus>;
}

const getInitialState = (): State => ({
    collaterals: Object.values(COLLATERALS).map(
        collateral =>
            ({
                ilk: collateral.ilk,
                symbol: collateral.symbol,
                tokenName: collateral.tokenName,
            } as CollateralRow)
    ),
    collateralStatusesStorage: {},
});

export const state = (): State => getInitialState();

export const getters = {
    collaterals(state: State) {
        return state.collaterals || [];
    },
    collateralStatuses(state: State, _getters: any, _rootState: any, rootGetters: any) {
        return Object.values(state.collateralStatusesStorage).map(collateralStatus => {
            const isAuthorized = rootGetters['authorizations/collateralAuthorizations'].includes(
                collateralStatus.type
            );
            const isAuthorizing = rootGetters['authorizations/authorizingCollaterals'].includes(collateralStatus.type);
            const isDepositingOrWithdrawing = rootGetters['wallet/depositingOrWithdrawingCollaterals'].includes(
                collateralStatus.type
            );
            const balance = rootGetters['wallet/collateralVatBalanceStore'][collateralStatus.type];
            return {
                ...collateralStatus,
                isAuthorized,
                isAuthorizing,
                isDepositingOrWithdrawing,
                balance,
            };
        });
    },
};

export const mutations = {
    setCollaterals(state: State, collaterals: CollateralRow[]) {
        state.collaterals = [...collaterals];
    },
    updateCollateral(state: State, updatedCollateral: CollateralRow) {
        const collateralIndex = state.collaterals.findIndex(collateral => collateral.ilk === updatedCollateral.ilk);
        Vue.set(state.collaterals, collateralIndex, {
            ...state.collaterals[collateralIndex],
            ...updatedCollateral,
        });
    },
    setCollateralStatus(state: State, collateralStatus: CollateralStatus) {
        Vue.set(state.collateralStatusesStorage, collateralStatus.type, collateralStatus);
    },
    reset(state: State) {
        Object.assign(state, getInitialState());
    },
};

export const actions = {
    async fetchCoreValues({ commit, rootGetters }: ActionContext<State, State>) {
        const network = rootGetters['network/getMakerNetwork'];
        if (!network) {
            return;
        }
        for (const collateral of Object.values(COLLATERALS)) {
            const tokenAddress = await getTokenAddressByNetworkAndSymbol(network, collateral.symbol).catch(error => {
                console.error(error);
                commit('updateCollateral', {
                    ilk: collateral.ilk,
                    tokenAddressError: error.toString(),
                });
                return undefined;
            });
            const marketUnitPrice = await getMarketPrice(network, collateral.symbol).catch(error => {
                console.error(error);
                return error.toString();
            });
            const calcParameters = await fetchCalcParametersByCollateralType(network, collateral.ilk).catch(error => {
                console.error(error);
                return {
                    secondsBetweenPriceDrops: error.toString(),
                    priceDropRatio: error.toString(),
                };
            });
            const autoRouteData = await fetchAutoRouteInformation(network, collateral.symbol);

            const updated = {
                ilk: collateral.ilk,
                marketUnitPrice,
                secondsBetweenPriceDrops: calcParameters.secondsBetweenPriceDrops,
                priceDropRatio: calcParameters.priceDropRatio,
                tokenAddress,
                autoRouteQuote: autoRouteData.totalPrice,
                autoRouteExchanges: autoRouteData.route,
                autoRouteError: autoRouteData.errorMessage,
            };
            commit('updateCollateral', updated);
        }
    },
    fetchCollateralStatuses({ dispatch, rootGetters }: ActionContext<State, State>) {
        const network = rootGetters['network/getMakerNetwork'];
        if (!network) {
            return;
        }
        for (const collateralType of getAllCollateralTypes()) {
            dispatch('resetCollateralStatus', collateralType);
        }
        for (const collateralType of getAllCollateralTypes()) {
            dispatch('fetchCollateralStatus', collateralType);
        }
    },
    resetCollateralStatus({ commit }: ActionContext<State, State>, collateralType: string) {
        const collateral = getCollateralConfigByType(collateralType);
        commit('setCollateralStatus', {
            type: collateral.ilk,
            symbol: collateral.symbol,
            tokenName: collateral.tokenName,
        });
    },
    async fetchCollateralStatus(
        { commit, dispatch, rootGetters }: ActionContext<State, State>,
        collateralType: string
    ) {
        const network = rootGetters['network/getMakerNetwork'];
        if (!network) {
            return;
        }
        const collateral = getCollateralConfigByType(collateralType);
        try {
            const tokenAddress = await getTokenAddressByNetworkAndSymbol(network, collateral.symbol);
            if (!(await isCollateralTypeSupported(network, collateral.ilk))) {
                throw new Error(`Unsupported collaterals ${collateral.ilk}`);
            }
            await dispatch('wallet/fetchCollateralVatBalance', collateralType, { root: true });
            await dispatch('authorizations/fetchCollateralAuthorizationStatus', collateralType, { root: true });
            commit('setCollateralStatus', {
                type: collateral.ilk,
                symbol: collateral.symbol,
                tokenName: collateral.tokenName,
                address: tokenAddress,
            });
        } catch {
            commit('setCollateralStatus', {
                type: collateral.ilk,
                symbol: collateral.symbol,
                tokenName: collateral.tokenName,
                address: null,
            });
        }
    },
    async setup({ commit, dispatch }: ActionContext<State, State>) {
        commit('reset');

        await dispatch('fetchCoreValues');
        await dispatch('fetchCollateralStatuses');
    },
};

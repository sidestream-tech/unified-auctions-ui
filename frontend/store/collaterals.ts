import { ActionContext } from 'vuex';
import type { CollateralRow } from 'auctions-core/src/types';
import COLLATERALS from 'auctions-core/src/constants/COLLATERALS';
import { getExchangeRateBySymbol } from 'auctions-core/src/uniswap';
import { fetchCalcParametersByCollateralType } from 'auctions-core/src/params';
import Vue from 'vue';
import { isCollateralSupported } from 'auctions-core/src/contracts';

interface State {
    collaterals: CollateralRow[];
    isOnChain: Record<string, boolean>;
}

export const state = (): State => ({
    collaterals: [],
    isOnChain: {},
});

export const getters = {
    collaterals(state: State) {
        return state.collaterals || [];
    },
    getIsOnChain: (state: State) => (collateral: string) => {
        return state.isOnChain[collateral];
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
    setIsOnChain(state: State, { collateral, isOnChain }: { collateral: string; isOnChain: boolean }) {
        state.isOnChain[collateral] = isOnChain;
    },
};

export const actions = {
    async fetchStepAndCut({ getters, commit, rootGetters }: ActionContext<State, State>) {
        const network = rootGetters['network/getMakerNetwork'];
        if (!network) {
            return;
        }
        for (const collateral of Object.values(COLLATERALS)) {
            if (getters.getIsOnChain(collateral.symbol) === false) {
                continue;
            }
            const marketUnitPrice = await getExchangeRateBySymbol(network, collateral.symbol).catch(error => {
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
            const updated = {
                ilk: collateral.ilk,
                marketUnitPrice,
                secondsBetweenPriceDrops: calcParameters.secondsBetweenPriceDrops,
                priceDropRatio: calcParameters.priceDropRatio,
            };
            commit('updateCollateral', updated);
        }
    },
    async fetchCollateralsOnChain({ commit, rootGetters }: ActionContext<State, State>) {
        const pageNetwork = rootGetters['network/getPageNetwork'];
        for (const collateral of Object.values(COLLATERALS)) {
            const supported = await isCollateralSupported(pageNetwork, collateral.symbol);
            commit('setIsOnChain', { collateral: collateral.symbol, isOnChain: supported });
        }
    },
    async setup({ commit, dispatch }: ActionContext<State, State>) {
        const collaterals = Object.values(COLLATERALS).map(collateral => ({
            ilk: collateral.ilk,
            symbol: collateral.symbol,
        }));
        commit('setCollaterals', collaterals);

        await dispatch('fetchCollateralsOnChain');
        await dispatch('fetchStepAndCut');
    },
};

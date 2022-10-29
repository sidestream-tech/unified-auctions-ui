import type { CalleeNames, CalleeFunctions, MarketData } from '../types';
import memoizee from 'memoizee';
import BigNumber from '../bignumber';
import UniswapV2CalleeDai from './UniswapV2CalleeDai';
import UniswapV2LpTokenCalleeDai from './UniswapV2LpTokenCalleeDai';
import WstETHCurveUniv3Callee from './WstETHCurveUniv3Callee';
import CurveLpTokenUniv3Callee from './CurveLpTokenUniv3Callee';
import UniswapV3Callee from './UniswapV3Callee';
import rETHCurveUniv3Callee from './rETHCurveUniv3Callee';
import { getCollateralConfigByType, getCollateralConfigBySymbol } from '../constants/COLLATERALS';

const MARKET_PRICE_CACHE_MS = 10 * 1000;

const allCalleeFunctions: Record<CalleeNames, CalleeFunctions> = {
    UniswapV2CalleeDai,
    UniswapV2LpTokenCalleeDai,
    WstETHCurveUniv3Callee,
    CurveLpTokenUniv3Callee,
    UniswapV3Callee,
    rETHCurveUniv3Callee,
};

export const getCalleeData = async function (
    network: string,
    collateralType: string,
    marketId: string,
    profitAddress: string
): Promise<string> {
    const collateral = getCollateralConfigByType(collateralType);
    const marketData = collateral.exchanges[marketId];
    if (!marketData || !marketData.callee || !allCalleeFunctions[marketData.callee]) {
        throw new Error(`Unsupported collateral type "${collateralType}"`);
    }
    return await allCalleeFunctions[marketData.callee].getCalleeData(network, collateral, profitAddress);
};

export const getMarketData = async function (
    network: string,
    collateralSymbol: string,
    amount: BigNumber = new BigNumber('1')
): Promise<Record<string, MarketData>> {
    const collateral = getCollateralConfigBySymbol(collateralSymbol);
    let isCollateralSupported = false;
    for (const market of Object.values(collateral.exchanges)) {
        if (market.callee && allCalleeFunctions[market.callee]) {
            isCollateralSupported = true;
            break;
        }
    }
    if (!isCollateralSupported) {
        throw new Error(`Unsupported collateral symbol "${collateralSymbol}"`);
    }
    const marketData = {};
    for (const [key, value] of Object.entries(collateral.exchanges)) {
        let marketUnitPrice: BigNumber;
        try {
            marketUnitPrice = await allCalleeFunctions[value.callee].getMarketPrice(network, collateral, amount);
        } catch {
            marketUnitPrice = new BigNumber(NaN);
        }
        if ('route' in value) {
            Object.assign(marketData, {
                [key]: {
                    marketUnitPrice,
                    route: value.route,
                },
            });
        } else {
            Object.assign(marketData, {
                [key]: {
                    marketUnitPrice,
                    token0: value.token0,
                    token1: value.token1,
                },
            });
        }
    }
    return marketData;
};

export type BestMarketData = {
    marketId: string;
    marketUnitPrice: BigNumber;
};

export const getBestMarketData = async function (marketData: Record<string, MarketData>): Promise<BestMarketData> {
    const marketDataSorted = Object.entries(marketData);
    marketDataSorted.sort((a, b) => {
        // push NaNs to the end
        if (a[1].marketUnitPrice.isNaN() && b[1].marketUnitPrice.isNaN()) {
            return 1;
        }
        if (a[1].marketUnitPrice.isNaN()) {
            return 1;
        }
        if (b[1].marketUnitPrice.isNaN()) {
            return -1;
        }
        return a[1].marketUnitPrice.minus(b[1].marketUnitPrice).toNumber();
    });
    return {
        marketId: marketDataSorted[0][0],
        marketUnitPrice: marketDataSorted[0][1].marketUnitPrice,
    };
};

const _getMarketPrice = async function (
    network: string,
    collateralSymbol: string,
    amount: BigNumber = new BigNumber('1')
): Promise<BigNumber> {
    const marketData = await getMarketData(network, collateralSymbol, amount);
    const bestMarketData = await getBestMarketData(marketData);
    return bestMarketData.marketUnitPrice;
};

export const getMarketPrice = memoizee(_getMarketPrice, {
    maxAge: MARKET_PRICE_CACHE_MS,
    promise: true,
    length: 3,
});

export default allCalleeFunctions;

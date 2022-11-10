import type { CalleeNames, CalleeFunctions, MarketData, CollateralConfig, CollateralSymbol, CalleeConfig, Pool, MarketDataUniswapV2LpToken, MarketDataRegular, MarketDataUniswapV3Automatic } from '../types';
import memoizee from 'memoizee';
import BigNumber from '../bignumber';
import UniswapV2CalleeDai from './UniswapV2CalleeDai';
import UniswapV2LpTokenCalleeDai from './UniswapV2LpTokenCalleeDai';
import WstETHCurveUniv3Callee from './WstETHCurveUniv3Callee';
import CurveLpTokenUniv3Callee from './CurveLpTokenUniv3Callee';
import UniswapV3Callee from './UniswapV3Callee';
import rETHCurveUniv3Callee from './rETHCurveUniv3Callee';
import { getCollateralConfigByType, getCollateralConfigBySymbol } from '../constants/COLLATERALS';
import { routeToPool } from './helpers/pools';
import { fetchAutoRouteInformation } from './helpers/uniswapAutoRouter';
import { UNISWAP_FEE } from './helpers/uniswapV3';

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
    profitAddress: string,
    pools?: Pool[]
): Promise<string> {
    const collateral = getCollateralConfigByType(collateralType);
    const marketData = collateral.exchanges[marketId];
    if (!marketData || !marketData.callee || !allCalleeFunctions[marketData.callee]) {
        throw new Error(`Unsupported collateral type "${collateralType}"`);
    }
    return await allCalleeFunctions[marketData.callee].getCalleeData(network, collateral, marketId, profitAddress, pools);
};
const getCalleeAutoRoute = async (
    network: string,
    collateral: CollateralConfig,
    marketId: string,
    amount: BigNumber = new BigNumber('1')
): Promise<string[] | undefined> => {
    const calleeConfig = collateral.exchanges[marketId];
    if (!('automaticRouter' in calleeConfig)) {
        return undefined;
    }
    return (await fetchAutoRouteInformation(network, collateral.symbol, amount.toFixed())).route || [];
}

const getMarketDataWithoutPrice = (calleeConfig: CalleeConfig, route: string[] | undefined, pools: Pool[] | undefined) => {
    if (!route && calleeConfig.callee === 'UniswapV2LpTokenCalleeDai') {
        const uniswapV2LpMarketData: Omit<MarketDataUniswapV2LpToken, 'marketUnitPrice'> = calleeConfig;
        return uniswapV2LpMarketData;
    }
    if ('route' in calleeConfig && pools) {
        const regularMarketData: Omit<MarketDataRegular, 'marketUnitPrice'> = {...calleeConfig, pools};
        return regularMarketData;
    }
    if ('automaticRouter' in calleeConfig && route && pools) {
        const autorouterMarketData: Omit<MarketDataUniswapV3Automatic, 'marketUnitPrice'> = {...calleeConfig, route, pools};
        return autorouterMarketData;
    }
    throw new Error('Unexpected market data parameters. Failed to determine the callee type.');
}

export const getMarketDataById = async function (
    network: string,
    collateral: CollateralConfig,
    marketId: string,
    amount: BigNumber = new BigNumber('1')
): Promise<MarketData> {
    const calleeConfig = collateral.exchanges[marketId];
    if (!allCalleeFunctions[calleeConfig?.callee]) {
        throw new Error(`Unsupported callee "${calleeConfig?.callee}" for collateral symbol "${collateral.symbol}"`);
    }

    const route = 'route' in calleeConfig ? calleeConfig.route : await getCalleeAutoRoute(network, collateral, marketId, amount);
    const pools = route ? await routeToPool(network, route, UNISWAP_FEE) : undefined;

    let marketUnitPrice: BigNumber;
    try {
        marketUnitPrice = await allCalleeFunctions[calleeConfig.callee].getMarketPrice(
            network,
            collateral,
            marketId,
            amount
        );
    } catch (error: any) {
        const errorMessage = error?.message;
        marketUnitPrice = new BigNumber(NaN);
        return {
            ...getMarketDataWithoutPrice(calleeConfig, route, pools),
            marketUnitPrice,
            errorMessage,
        };
    }
    return {
        ...getMarketDataWithoutPrice(calleeConfig, route, pools),
        marketUnitPrice: marketUnitPrice ? marketUnitPrice : new BigNumber(NaN),
    };
};

export const getMarketDataRecords = async function (
    network: string,
    collateralSymbol: CollateralSymbol,
    amount: BigNumber = new BigNumber('1')
): Promise<Record<string, MarketData>> {
    const collateral = getCollateralConfigBySymbol(collateralSymbol);
    let marketDataRecords = {};
    for (const marketId in collateral.exchanges) {
        let marketData: MarketData;
        try {
            marketData = await getMarketDataById(network, collateral, marketId, amount);
        } catch (error: any) {
            marketData = {
                errorMessage: error?.message,
                marketUnitPrice: new BigNumber(NaN),
                route: [], // dummy value: MarketData requires either a route or tokens
                pools: [],
            };
        }
        marketDataRecords = {
            ...marketDataRecords,
            [marketId]: {
                ...marketData,
            },
        };
    }
    return marketDataRecords;
};

export const getBestMarketId = async function (marketDataRecords: Record<string, MarketData>): Promise<string> {
    const marketDataRecordsSorted = Object.entries(marketDataRecords);
    marketDataRecordsSorted.sort((a, b) => {
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
        return a[1].marketUnitPrice.minus(b[1].marketUnitPrice).multipliedBy(-1).toNumber();
    });
    return marketDataRecordsSorted[0][0];
};

const _getMarketPrice = async function (
    network: string,
    collateralSymbol: string,
    amount: BigNumber = new BigNumber('1')
): Promise<BigNumber> {
    // get collateral config and if exchanges contains automaticRouter, use that
    const marketDataRecords = await getMarketDataRecords(network, collateralSymbol, amount);
    const bestMarketId = await getBestMarketId(marketDataRecords);
    return marketDataRecords[bestMarketId].marketUnitPrice;
};

export const getMarketPrice = memoizee(_getMarketPrice, {
    maxAge: MARKET_PRICE_CACHE_MS,
    promise: true,
    length: 3,
});

export default allCalleeFunctions;

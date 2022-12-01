import type {
    CalleeNames,
    CalleeFunctions,
    MarketData,
    CollateralConfig,
    CollateralSymbol,
    RegularCalleeConfig,
    UniswapV2LpTokenCalleeConfig,
    AutoRouterCalleeConfig,
    Pool,
} from '../types';
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
    preloadedPools?: Pool[]
): Promise<string> {
    const collateral = getCollateralConfigByType(collateralType);
    const marketData = collateral.exchanges[marketId];
    if (!marketData || !marketData.callee || !allCalleeFunctions[marketData.callee]) {
        throw new Error(`Unsupported collateral type "${collateralType}"`);
    }
    return await allCalleeFunctions[marketData.callee].getCalleeData(
        network,
        collateral,
        marketId,
        profitAddress,
        preloadedPools
    );
};
const getCalleeAutoRoute = async (
    network: string,
    collateral: CollateralConfig,
    marketId: string,
    amount: BigNumber = new BigNumber('1')
): Promise<string[]> => {
    const calleeConfig = collateral.exchanges[marketId];
    if (!('automaticRouter' in calleeConfig)) {
        throw new Error('Unexpected market data parameters. Failed to determine the callee type.');
    }
    return (await fetchAutoRouteInformation(network, collateral.symbol, amount.toFixed())).route || [];
};

export const getPools = async (
    network: string,
    collateral: CollateralConfig,
    marketId: string,
    amount: BigNumber = new BigNumber(1)
) => {
    const calleeConfig = collateral.exchanges[marketId];
    if (calleeConfig.callee === 'UniswapV2LpTokenCalleeDai') {
        return undefined;
    }
    const route =
        'route' in calleeConfig ? calleeConfig.route : await getCalleeAutoRoute(network, collateral, marketId, amount);
    return await routeToPool(network, route);
};

export const enrichCalleeConfigWithPools = async (
    network: string,
    collateral: CollateralConfig,
    marketId: string,
    amount: BigNumber
): Promise<UniswapV2LpTokenCalleeConfig | ((RegularCalleeConfig | AutoRouterCalleeConfig) & { pools: Pool[] })> => {
    const config = collateral.exchanges[marketId];
    if (config.callee === 'UniswapV2LpTokenCalleeDai') {
        return { ...config };
    }
    const pools = await getPools(network, collateral, marketId, amount);
    if (pools) {
        return { ...config, pools };
    }
    throw new Error('Failed to get pools');
};

export const getMarketDataById = async function (
    network: string,
    collateral: CollateralConfig,
    marketId: string,
    amount: BigNumber = new BigNumber('1')
): Promise<MarketData> {
    const calleeConfig = await enrichCalleeConfigWithPools(network, collateral, marketId, amount);
    if (!allCalleeFunctions[calleeConfig?.callee]) {
        throw new Error(`Unsupported callee "${calleeConfig?.callee}" for collateral symbol "${collateral.symbol}"`);
    }
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
            ...calleeConfig,
            marketUnitPrice,
            errorMessage,
        };
    }
    return {
        ...calleeConfig,
        marketUnitPrice: marketUnitPrice ? marketUnitPrice : new BigNumber(NaN),
    };
};

const getMarketDataRecords = async function (
    network: string,
    collateralSymbol: CollateralSymbol,
    amount: BigNumber = new BigNumber('1'),
    useAutoRouter = false
): Promise<Record<string, MarketData>> {
    const collateral = getCollateralConfigBySymbol(collateralSymbol);
    let marketDataRecords = {};
    for (const marketId in collateral.exchanges) {
        let marketData: MarketData;
        try {
            // turn off autorouter during tests because it takes too long
            if ((process.env.NODE_ENV === 'test' || !useAutoRouter) && marketId === 'Uniswap V3 Autorouter') {
                marketData = {
                    marketUnitPrice: new BigNumber(NaN),
                    pools: [], // dummy value: MarketData requires either a pool or tokens
                };
            } else {
                marketData = await getMarketDataById(network, collateral, marketId, amount);
            }
        } catch (error: any) {
            marketData = {
                errorMessage: error?.message,
                marketUnitPrice: new BigNumber(NaN),
                pools: [], // dummy value: MarketData requires either a pool or tokens
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

export const _getMarketPrice = async function (
    network: string,
    collateralSymbol: string,
    amount: BigNumber = new BigNumber('1')
): Promise<BigNumber> {
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

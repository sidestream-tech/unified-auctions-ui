import type {
    CalleeNames,
    CalleeFunctions,
    MarketData,
    CollateralConfig,
    CollateralSymbol,
    Pool,
    PriceWithPools,
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

export const getPools = async (
    network: string,
    collateral: CollateralConfig,
    marketId: string
): Promise<Pool[] | undefined> => {
    const calleeConfig = collateral.exchanges[marketId];
    if ('route' in calleeConfig) {
        return await routeToPool(network, calleeConfig.route, collateral.symbol);
    }
    if ('automaticRouter' in calleeConfig) {
        throw new Error('This function should not be called for callees whre autorouter is enabled');
    }
    return undefined;
};

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
    let marketPrice: PriceWithPools;

    try {
        marketPrice = await allCalleeFunctions[calleeConfig.callee].getMarketPrice(
            network,
            collateral,
            marketId,
            amount
        );
    } catch (error: any) {
        const errorMessage = error?.message;
        return {
            ...calleeConfig,
            marketUnitPrice: new BigNumber(NaN),
            pools: [],
            errorMessage,
        };
    }
    const marketUnitPrice = marketPrice.price;
    if (calleeConfig.callee !== 'UniswapV2LpTokenCalleeDai' && marketPrice.pools) {
        return {
            ...calleeConfig,
            marketUnitPrice: marketUnitPrice ? marketUnitPrice : new BigNumber(NaN),
            pools: marketPrice.pools,
        };
    }
    if (calleeConfig.callee === 'UniswapV2LpTokenCalleeDai') {
        return {
            ...calleeConfig,
            marketUnitPrice: marketUnitPrice ? marketUnitPrice : new BigNumber(NaN),
        };
    }
    throw new Error('No pools found where expected');
};

export const getMarketDataRecords = async function (
    network: string,
    collateralSymbol: CollateralSymbol,
    amount: BigNumber = new BigNumber('1'),
    useAutoRouter = false
): Promise<Record<string, MarketData>> {
    const collateral = getCollateralConfigBySymbol(collateralSymbol);
    let marketDataRecords = {};
    for (const [marketId, exchange] of Object.entries(collateral.exchanges)) {
        let marketData: MarketData;
        try {
            // turn off autorouter during tests because it takes too long
            if (
                (process.env.NODE_ENV === 'test' || !useAutoRouter) &&
                'automaticRouter' in exchange &&
                exchange.automaticRouter
            ) {
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

const _getMarketPrice = async function (
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

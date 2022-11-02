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
    return await allCalleeFunctions[marketData.callee].getCalleeData(network, collateral, marketId, profitAddress);
};

export const getMarketData = async function (
    network: string,
    collateralSymbol: string,
    amount: BigNumber = new BigNumber('1')
): Promise<Record<string, MarketData>> {
    const collateral = getCollateralConfigBySymbol(collateralSymbol);
    const isCollateralSupported = Object.values(collateral.exchanges).some(
        marketData => marketData.callee && allCalleeFunctions[marketData.callee]
    );
    if (!isCollateralSupported) {
        throw new Error(`Unsupported collateral symbol "${collateralSymbol}"`);
    }
    let marketDataRecords = {};
    for (const marketId in collateral.exchanges) {
        const marketData = collateral.exchanges[marketId];
        let marketUnitPrice: BigNumber;
        try {
            marketUnitPrice = await allCalleeFunctions[marketData.callee].getMarketPrice(
                network,
                collateral,
                marketId,
                amount
            );
        } catch {
            marketUnitPrice = new BigNumber(NaN);
        }
        if (marketData.callee === 'UniswapV2LpTokenCalleeDai') {
            marketDataRecords = {
                ...marketData,
                [marketId]: {
                    marketUnitPrice,
                    token0: marketData.token0,
                    token1: marketData.token1,
                },
            };
        } else {
            marketDataRecords = {
                ...marketData,
                [marketId]: {
                    marketUnitPrice,
                    route: marketData.route,
                },
            };
        }
    }
    return marketDataRecords;
};

export type BestMarketData = {
    marketId: string;
    marketUnitPrice: BigNumber;
};

export const getBestMarketData = async function (
    marketDataRecords: Record<string, MarketData>
): Promise<BestMarketData> {
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
        return a[1].marketUnitPrice.minus(b[1].marketUnitPrice).toNumber();
    });
    return {
        marketId: marketDataRecordsSorted[0][0],
        marketUnitPrice: marketDataRecordsSorted[0][1].marketUnitPrice,
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

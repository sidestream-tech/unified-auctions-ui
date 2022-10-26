import type {
    CalleeNames,
    CalleeFunctions,
    MarketData,
    RegularCalleeConfig,
    UniswapV2LpTokenCalleeConfig,
} from '../types';
import { getGasPriceForUI } from '../gas';
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

export const getCalleesData = async function (
    network: string,
    collateralType: string,
    profitAddress: string
): Promise<Record<string, string>> {
    const collateral = getCollateralConfigByType(collateralType);
    const calleeFuctions = {} as Record<string, CalleeFunctions>;
    Object.entries(collateral.exchanges).forEach(([key, value]) => {
        calleeFuctions[key] = allCalleeFunctions[value.callee];
    });
    if (!Object.keys(calleeFuctions).length) {
        throw new Error(`Unsupported collateral type "${collateralType}"`);
    }
    const calleesData = {} as Record<string, string>;
    Object.entries(calleeFuctions).forEach(async ([key, value]) => {
        calleesData[key] = await value.getCalleeData(network, collateral, profitAddress);
    });
    return calleesData;
};

export const getMarketData = async function (
    network: string,
    collateralSymbol: string,
    amount: BigNumber = new BigNumber('1')
): Promise<Record<string, MarketData>> {
    const collateral = getCollateralConfigBySymbol(collateralSymbol);
    const calleeIdAndFuctions = {} as Record<string, CalleeFunctions>;
    Object.keys(collateral.exchanges).forEach(id => {
        calleeIdAndFuctions[id] = allCalleeFunctions[collateral.exchanges[id].callee];
    });
    if (!Object.keys(calleeIdAndFuctions).length) {
        throw new Error(`Unsupported collateral symbol "${collateralSymbol}"`);
    }
    const marketData = {} as Record<string, MarketData>;
    const gasPrice = await getGasPriceForUI(network);
    const exchangeFee = gasPrice.multipliedBy(722651 - 145438);
    for (const id in calleeIdAndFuctions) {
        let marketUnitPrice: BigNumber;
        try {
            marketUnitPrice = await calleeIdAndFuctions[id].getMarketPrice(network, collateral, amount);
        } catch {
            marketUnitPrice = new BigNumber(NaN);
        }
        const data = {
            marketUnitPrice: marketUnitPrice ? marketUnitPrice : new BigNumber(NaN),
            exchangeFee,
        } as MarketData;
        if (collateral.exchanges[id].hasOwnProperty('route')) {
            data.route = (collateral.exchanges[id] as RegularCalleeConfig).route;
        } else {
            data.token0 = (collateral.exchanges[id] as UniswapV2LpTokenCalleeConfig).token0;
            data.token1 = (collateral.exchanges[id] as UniswapV2LpTokenCalleeConfig).token1;
        }
        marketData[id] = data;
    }
    return marketData;
};

export const getBestMarketData = async function (
    network: string,
    collateralSymbol: string,
    amount: BigNumber = new BigNumber('1')
): Promise<Record<string, string | BigNumber>> {
    const marketData = Object.entries(await getMarketData(network, collateralSymbol, amount));
    marketData.sort((a, b) => {
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
        marketId: marketData[0][0],
        marketUnitPrice: marketData[0][1].marketUnitPrice,
    };
};

const _getMarketPrice = async function (
    network: string,
    collateralSymbol: string,
    amount: BigNumber = new BigNumber('1')
): Promise<BigNumber> {
    return (await getBestMarketData(network, collateralSymbol, amount)).marketUnitPrice as BigNumber;
};

export const getMarketPrice = memoizee(_getMarketPrice, {
    maxAge: MARKET_PRICE_CACHE_MS,
    promise: true,
    length: 3,
});

export default allCalleeFunctions;

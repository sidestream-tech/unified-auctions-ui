import type { CalleeNames, CalleeFunctions } from '../types';
import memoizee from 'memoizee';
import BigNumber from '../bignumber';
import UniswapV2CalleeDai from './UniswapV2CalleeDai';
import UniswapV2LpTokenCalleeDai from './UniswapV2LpTokenCalleeDai';
import WstETHCurveUniv3Callee from './WstETHCurveUniv3Callee';
import CurveLpTokenUniv3Callee from './CurveLpTokenUniv3Callee';
import UniswapV3Callee from './UniswapV3Callee';
import { getCollateralConfigByType, getCollateralConfigBySymbol } from '../constants/COLLATERALS';

const MARKET_PRICE_CACHE_MS = 10 * 1000;

const allCalleeFunctions: Record<CalleeNames, CalleeFunctions> = {
    UniswapV2CalleeDai,
    UniswapV2LpTokenCalleeDai,
    WstETHCurveUniv3Callee,
    CurveLpTokenUniv3Callee,
    UniswapV3Callee,
};

export const getCalleeData = async function (
    network: string,
    collateralType: string,
    profitAddress: string
): Promise<string> {
    const collateral = getCollateralConfigByType(collateralType);
    const calleeFunctions = allCalleeFunctions[collateral.exchange.callee];
    if (!calleeFunctions) {
        throw new Error(`Unsupported collateral type "${collateralType}"`);
    }
    return await calleeFunctions.getCalleeData(network, collateral, profitAddress);
};

export const decodeCalleeData = function (collateralType: string, calleeData: string) {
    const collateral = getCollateralConfigByType(collateralType);
    const calleeFunctions = allCalleeFunctions[collateral.exchange.callee];
    if (!calleeFunctions) {
        throw new Error(`Unsupported collateral type "${collateralType}"`);
    }
    return calleeFunctions.decodeCalleeData(calleeData);
};

const _getMarketPrice = async function (
    network: string,
    collateralSymbol: string,
    amount: BigNumber = new BigNumber('1')
): Promise<BigNumber> {
    const collateral = getCollateralConfigBySymbol(collateralSymbol);
    const calleeFunctions = allCalleeFunctions[collateral.exchange.callee];
    if (!calleeFunctions) {
        throw new Error(`Unsupported collateral symbol "${collateralSymbol}"`);
    }
    return await calleeFunctions.getMarketPrice(network, collateral, amount);
};

export const getMarketPrice = memoizee(_getMarketPrice, {
    maxAge: MARKET_PRICE_CACHE_MS,
    promise: true,
    length: 3,
});

export default allCalleeFunctions;

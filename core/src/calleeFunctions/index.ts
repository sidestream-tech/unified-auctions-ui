import type { CalleeNames, CalleeFunctions } from '../types';
import BigNumber from '../bignumber';
import UniswapV2CalleeDai from './UniswapV2CalleeDai';
import UniswapV2LpTokenCalleeDai from './UniswapV2LpTokenCalleeDai';
import { getCollateralConfigByType, getCollateralConfigBySymbol } from '../constants/COLLATERALS';

const allCalleeFunctions: Record<CalleeNames, CalleeFunctions> = {
    UniswapV2CalleeDai,
    UniswapV2LpTokenCalleeDai,
};

export const getCalleeData = async function (
    network: string,
    collateralType: string,
    profitAddress: string
): Promise<string> {
    const collateral = getCollateralConfigByType(collateralType);
    const calleeFuctions = allCalleeFunctions[collateral.exchange.callee];
    if (!calleeFuctions) {
        throw new Error(`Unsupported collateral type "${collateralType}"`);
    }
    return await calleeFuctions.getCalleeData(network, collateral, profitAddress);
};

export const getMarketPrice = async function (
    network: string,
    collateralSymbol: string,
    amount: BigNumber = new BigNumber('1')
): Promise<BigNumber> {
    const collateral = getCollateralConfigBySymbol(collateralSymbol);
    const calleeFuctions = allCalleeFunctions[collateral.exchange.callee];
    if (!calleeFuctions) {
        throw new Error(`Unsupported collateral symbol "${collateralSymbol}"`);
    }
    return await calleeFuctions.getMarketPrice(network, collateral, amount);
};

export default allCalleeFunctions;

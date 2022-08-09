import type { CalleeFunctions, CollateralConfig } from '../types';
import { ethers } from 'ethers';
import BigNumber from '../bignumber';
import { getContractAddressByName, getJoinNameByCollateralType } from '../contracts';
import { getUniswapRouteAddressesBySymbol, getRegularTokenExchangeRateBySymbol } from './helpers/uniswapV2';

const TYPES_ARRAY = ['address', 'address', 'uint256', 'address[]'];

const getCalleeData = async function (
    network: string,
    collateral: CollateralConfig,
    profitAddress: string
): Promise<string> {
    if (collateral.exchange.callee !== 'UniswapV2CalleeDai') {
        throw new Error(`getCalleeData called with invalid collateral type "${collateral.ilk}"`);
    }
    const joinAdapterAddress = await getContractAddressByName(network, getJoinNameByCollateralType(collateral.ilk));
    const minProfit = 1;
    return ethers.utils.defaultAbiCoder.encode(TYPES_ARRAY, [
        profitAddress,
        joinAdapterAddress,
        minProfit,
        await getUniswapRouteAddressesBySymbol(network, collateral.symbol),
    ]);
};

const decodeCalleeData = function (calleeData: string) {
    return ethers.utils.defaultAbiCoder.decode(TYPES_ARRAY, calleeData);
};

const getMarketPrice = async function (
    network: string,
    collateral: CollateralConfig,
    amount: BigNumber
): Promise<BigNumber> {
    return await getRegularTokenExchangeRateBySymbol(network, collateral.symbol, amount);
};

const UniswapV2CalleeDai: CalleeFunctions = {
    getCalleeData,
    decodeCalleeData,
    getMarketPrice,
};

export default UniswapV2CalleeDai;

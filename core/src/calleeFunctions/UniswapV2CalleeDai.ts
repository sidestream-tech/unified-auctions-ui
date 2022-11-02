import type { CalleeFunctions, CollateralConfig } from '../types';
import { ethers } from 'ethers';
import BigNumber from '../bignumber';
import { getContractAddressByName, getJoinNameByCollateralType } from '../contracts';
import { getUniswapRouteAddressesBySymbol, getRegularTokenExchangeRateBySymbol } from './helpers/uniswapV2';

const getCalleeData = async function (
    network: string,
    collateral: CollateralConfig,
    marketId: string,
    profitAddress: string
): Promise<string> {
    const marketData = collateral.exchanges[marketId];
    if (marketData?.callee !== 'UniswapV2CalleeDai') {
        throw new Error(`getCalleeData called with invalid collateral type "${collateral.ilk}"`);
    }
    const joinAdapterAddress = await getContractAddressByName(network, getJoinNameByCollateralType(collateral.ilk));
    const minProfit = 1;
    const typesArray = ['address', 'address', 'uint256', 'address[]'];
    return ethers.utils.defaultAbiCoder.encode(typesArray, [
        profitAddress,
        joinAdapterAddress,
        minProfit,
        await getUniswapRouteAddressesBySymbol(network, collateral.symbol, marketId),
    ]);
};

const getMarketPrice = async function (
    network: string,
    collateral: CollateralConfig,
    marketId: string,
    amount: BigNumber
): Promise<BigNumber> {
    return await getRegularTokenExchangeRateBySymbol(network, collateral.symbol, marketId, amount);
};

const UniswapV2CalleeDai: CalleeFunctions = {
    getCalleeData,
    getMarketPrice,
};

export default UniswapV2CalleeDai;

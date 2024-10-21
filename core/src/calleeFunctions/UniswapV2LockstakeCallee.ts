import type { CalleeFunctions, CollateralConfig, Pool } from '../types';
import { ethers } from 'ethers';
import BigNumber from '../bignumber';
import { getUniswapRouteAddressesBySymbol, getRegularTokenExchangeRateBySymbol } from './helpers/uniswapV2';
import { routeToPool } from './helpers/pools';

const getCalleeData = async function (
    network: string,
    collateral: CollateralConfig,
    marketId: string,
    profitAddress: string
): Promise<string> {
    const marketData = collateral.exchanges[marketId];
    if (marketData?.callee !== 'UniswapV2LockstakeCallee') {
        throw new Error(`getCalleeData called with invalid collateral type "${collateral.ilk}"`);
    }
    const minProfit = 1;
    const typesArray = ['address', 'uint256', 'address[]'];
    return ethers.utils.defaultAbiCoder.encode(typesArray, [
        profitAddress,
        minProfit,
        await getUniswapRouteAddressesBySymbol(network, collateral.symbol, marketId),
    ]);
};

const getMarketPrice = async function (
    network: string,
    collateral: CollateralConfig,
    marketId: string,
    amount: BigNumber
): Promise<{ price: BigNumber; pools: Pool[] }> {
    const marketData = collateral.exchanges[marketId];
    if (marketData.callee !== 'UniswapV2LockstakeCallee') {
        throw new Error(`Can not get market price for the "${collateral.ilk}"`);
    }
    let price = await getRegularTokenExchangeRateBySymbol(network, collateral.symbol, marketId, amount);
    if (marketData.route[0] === 'SKY') {
        price = price.multipliedBy(24_000);
    }
    return {
        price,
        pools: await routeToPool(network, marketData.route, collateral.symbol),
    };
};

const UniswapV2CalleeDai: CalleeFunctions = {
    getCalleeData,
    getMarketPrice,
};

export default UniswapV2CalleeDai;

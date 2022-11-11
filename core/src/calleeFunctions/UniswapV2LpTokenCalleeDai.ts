import type { CalleeFunctions, CollateralConfig } from '../types';
import { ethers } from 'ethers';
import BigNumber from '../bignumber';
import { getContractAddressByName, getJoinNameByCollateralType } from '../contracts';
import {
    getUniswapRouteAddressesBySymbol,
    getUniswapPairBySymbols,
    getUniswapTokenBySymbol,
    getLpTokenTotalSupply,
    getTotalPriceInDai,
} from './helpers/uniswapV2';

const getCalleeData = async function (
    network: string,
    collateral: CollateralConfig,
    marketId: string,
    profitAddress: string,
): Promise<string> {
    const marketData = collateral.exchanges[marketId];
    if (marketData?.callee !== 'UniswapV2LpTokenCalleeDai') {
        throw new Error(`getCalleeData called with invalid collateral type "${collateral.ilk}"`);
    }
    const joinAdapterAddress = await getContractAddressByName(network, getJoinNameByCollateralType(collateral.ilk));
    const minProfit = 1;
    const typesArray = ['address', 'address', 'uint256', 'address[]', 'address[]'];
    return ethers.utils.defaultAbiCoder.encode(typesArray, [
        profitAddress,
        joinAdapterAddress,
        minProfit,
        await getUniswapRouteAddressesBySymbol(network, marketData.token0, marketId),
        await getUniswapRouteAddressesBySymbol(network, marketData.token1, marketId),
    ]);
};

const getMarketPrice = async function (
    network: string,
    collateral: CollateralConfig,
    marketId: string,
    amount: BigNumber
): Promise<BigNumber> {
    const marketData = collateral.exchanges[marketId];
    if (marketData?.callee !== 'UniswapV2LpTokenCalleeDai') {
        throw new Error(`"${collateral.symbol}" is not a UniSwap LP token`);
    }
    const uniswapPair = await getUniswapPairBySymbols(network, marketData.token0, marketData.token1);
    const totalSupply = await getLpTokenTotalSupply(network, collateral.symbol);
    const portionOfTheTotalSupply = amount.div(totalSupply);
    const totalPriceOfToken0 = await getTotalPriceInDai(
        network,
        uniswapPair.reserveOf(await getUniswapTokenBySymbol(network, marketData.token0)),
        marketId,
        portionOfTheTotalSupply
    );
    const totalPriceOfToken1 = await getTotalPriceInDai(
        network,
        uniswapPair.reserveOf(await getUniswapTokenBySymbol(network, marketData.token1)),
        marketId,
        portionOfTheTotalSupply
    );
    const totalPrice = totalPriceOfToken0.plus(totalPriceOfToken1);
    return totalPrice.dividedBy(amount);
};

const UniswapV2CalleeDai: CalleeFunctions = {
    getCalleeData,
    getMarketPrice,
};

export default UniswapV2CalleeDai;

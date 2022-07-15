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
    profitAddress: string
): Promise<string> {
    if (collateral.exchange.callee !== 'UniswapV2LpTokenCalleeDai') {
        throw new Error(`getCalleeData called with invalid collateral type "${collateral.ilk}"`);
    }
    const joinAdapterAddress = await getContractAddressByName(network, getJoinNameByCollateralType(collateral.ilk));
    const minProfit = 0;
    const typesArray = ['address', 'address', 'uint256', 'address[]', 'address[]'];
    return ethers.utils.defaultAbiCoder.encode(typesArray, [
        profitAddress,
        joinAdapterAddress,
        minProfit,
        await getUniswapRouteAddressesBySymbol(network, collateral.exchange.token0),
        await getUniswapRouteAddressesBySymbol(network, collateral.exchange.token1),
    ]);
};

const getMarketPrice = async function (
    network: string,
    collateral: CollateralConfig,
    amount: BigNumber,
    blockTag?: string | number
): Promise<BigNumber> {
    if (collateral.exchange.callee !== 'UniswapV2LpTokenCalleeDai') {
        throw new Error(`"${collateral.symbol}" is not a UniSwap LP token`);
    }
    const uniswapPair = await getUniswapPairBySymbols(network, collateral.exchange.token0, collateral.exchange.token1);
    const totalSupply = await getLpTokenTotalSupply(network, collateral.symbol, blockTag);
    const portionOfTheTotalSupply = amount.div(totalSupply);
    const totalPriceOfToken0 = await getTotalPriceInDai(
        network,
        uniswapPair.reserveOf(await getUniswapTokenBySymbol(network, collateral.exchange.token0)),
        portionOfTheTotalSupply
    );
    const totalPriceOfToken1 = await getTotalPriceInDai(
        network,
        uniswapPair.reserveOf(await getUniswapTokenBySymbol(network, collateral.exchange.token1)),
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

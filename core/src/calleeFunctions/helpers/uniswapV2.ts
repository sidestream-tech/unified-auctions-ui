/*
    Most of the uniswap logic based on the `auction-demo-keeper` source code
    https://github.com/makerdao/auction-demo-keeper/blob/main/src/clipper.js#L134-L160
    More info on how UniSwap works and other available methods can be found here:
    https://www.quicknode.com/guides/defi/how-to-interact-with-uniswap-using-javascript#interacting-with-uniswap
*/
import type { CollateralConfig, RegularCalleeConfig } from '../../types';
import { ethers } from 'ethers';
import memoizee from 'memoizee';
import { Fetcher, Token, Pair, Route, TokenAmount, Trade, TradeType } from '@uniswap/sdk';
import { abi as uniswapV2PairABI } from '@uniswap/v2-core/build/UniswapV2Pair.json';
import BigNumber from '../../bignumber';
import { getDecimalChainIdByNetworkType } from '../../network';
import getProvider from '../../provider';
import { getTokenAddressByNetworkAndSymbol, getTokenDecimalsBySymbol } from '../../tokens';
import { getCollateralConfigBySymbol } from '../../constants/COLLATERALS';

const EXCHANGE_RATE_CACHE = 20 * 1000;

const getCalleeConfig = function (collateral: CollateralConfig, _marketId: string): RegularCalleeConfig {
    // TODO: remove _marketId from the all uniswapV2 functions, since they have to always use 'Uniswap V2' config
    const marketData = collateral.exchanges['Uniswap V2'];
    const isUniswapTokenNonAutoRouted =
        (marketData?.callee === 'UniswapV2CalleeDai' ||
            marketData?.callee === 'UniswapV3Callee' ||
            marketData?.callee === 'UniswapV2LockstakeCallee') &&
        !('automaticRouter' in marketData);
    if (isUniswapTokenNonAutoRouted) {
        return marketData;
    }
    throw new Error(`"${collateral.symbol}" is not an Uniswap token`);
};

export const getCompleteExchangePathBySymbol = function (symbol: string, marketId: string, useExchangeRoute = true) {
    if (symbol === 'DAI') {
        // no exchange is needed for DAI -> DAI
        return ['DAI'];
    }
    const collateral = getCollateralConfigBySymbol(symbol);
    return !useExchangeRoute ? [symbol, 'DAI'] : getCalleeConfig(collateral, marketId).route;
};

export const getUniswapRouteAddressesBySymbol = async function (
    network: string,
    symbol: string,
    marketId: string
): Promise<string[]> {
    const completeExchangePath = getCompleteExchangePathBySymbol(symbol, marketId);
    return await Promise.all(
        completeExchangePath.map(exchangePathSymbol => getTokenAddressByNetworkAndSymbol(network, exchangePathSymbol))
    );
};

export const getUniswapTokenBySymbol = async function (network: string, symbol: string): Promise<Token> {
    const tokenAddress = await getTokenAddressByNetworkAndSymbol(network, symbol);
    const tokenDecimals = getTokenDecimalsBySymbol(symbol);
    const decimalChainId = getDecimalChainIdByNetworkType(network);
    return new Token(decimalChainId, tokenAddress, tokenDecimals, symbol);
};

const _getCachedUniswapPairBySymbols = async function (
    network: string,
    symbol1: string,
    symbol2: string
): Promise<Pair | undefined> {
    const provider = await getProvider(network);
    const token1 = await getUniswapTokenBySymbol(network, symbol1);
    const token2 = await getUniswapTokenBySymbol(network, symbol2);
    try {
        return await Fetcher.fetchPairData(token1, token2, provider);
    } catch (error) {
        return undefined;
    }
};

const getCachedUniswapPairBySymbols = memoizee(_getCachedUniswapPairBySymbols, {
    maxAge: EXCHANGE_RATE_CACHE,
    promise: true,
    length: 3,
});

export const getUniswapPairBySymbols = async function (
    network: string,
    symbol1: string,
    symbol2: string
): Promise<Pair> {
    const cachedResult = await getCachedUniswapPairBySymbols(network, symbol1, symbol2);

    if (!cachedResult) {
        throw new Error(`The pair of "${symbol1}/${symbol2}" is not tradable on UniSwap "${network}" network`);
    }
    return cachedResult;
};

export const splitArrayIntoPairs = function (array: string[]): string[][] {
    /*
        Function that takes an array of strings, e.g.: `[ 'one', 'two', 'three' ]`
        and turns it into array or pairs, e.g.: `[ ['one', 'two'], [ 'two', 'three' ] ]`
    */
    const pairs = [];
    for (let index = 0; index < array.length - 1; index++) {
        pairs.push([array[index], array[index + 1]]);
    }
    return pairs;
};

export const getLpTokenTotalSupply = async function (network: string, symbol: string): Promise<BigNumber> {
    const provider = await getProvider(network);
    const address = await getTokenAddressByNetworkAndSymbol(network, symbol);
    const contract = new ethers.Contract(address, uniswapV2PairABI, provider);
    const totalSupply = await contract.totalSupply();
    const collateral = getCollateralConfigBySymbol(symbol);
    return new BigNumber(totalSupply.toString()).shiftedBy(-collateral.decimals);
};

export const getRegularTokenExchangeRateBySymbol = async function (
    network: string,
    symbol: string,
    marketId: string,
    amount: BigNumber
): Promise<BigNumber> {
    const collateral = getCollateralConfigBySymbol(symbol);
    getCalleeConfig(collateral, marketId); // to check that the callee is supported
    const completeExchangePath = getCompleteExchangePathBySymbol(symbol, marketId);
    const pairs = splitArrayIntoPairs(completeExchangePath);
    const uniswapPairs = await Promise.all(pairs.map(pair => getUniswapPairBySymbols(network, pair[0], pair[1])));
    const exchangeToken = await getUniswapTokenBySymbol(network, completeExchangePath[0]);
    const uniswapRoute = new Route(uniswapPairs, exchangeToken);
    const uniswapTrade = new Trade(
        uniswapRoute,
        new TokenAmount(exchangeToken, amount.shiftedBy(collateral.decimals).toFixed(0)),
        TradeType.EXACT_INPUT
    );
    return new BigNumber(uniswapTrade.executionPrice.toSignificant(collateral.decimals));
};

export const getTotalPriceInDai = async function (
    network: string,
    reserve: TokenAmount,
    marketId: string,
    portionOfTheTotalSupply: BigNumber
): Promise<BigNumber> {
    if (!reserve.token.symbol) {
        throw new Error(`reserve.token.symbol is not defined`);
    }
    const amountInThePool = new BigNumber(reserve.toFixed(reserve.token.decimals));
    const amountOwned = amountInThePool.multipliedBy(portionOfTheTotalSupply);
    if (reserve.token.symbol === 'DAI') {
        return amountOwned;
    }
    const tokenExchangeRate = await getRegularTokenExchangeRateBySymbol(
        network,
        reserve.token.symbol,
        marketId,
        amountOwned
    );
    return tokenExchangeRate.multipliedBy(amountOwned);
};

/* 
    Most of the uniswap logic based on the `auction-demo-keeper` source code
    https://github.com/makerdao/auction-demo-keeper/blob/main/src/clipper.js#L134-L160
*/
import { ethers } from 'ethers';
import memoizee from 'memoizee';
import { Fetcher, Token, Route, Pair, Trade, TokenAmount, TradeType } from '@uniswap/sdk';
import { abi as uniswapV2PairABI } from '@uniswap/v2-core/build/UniswapV2Pair.json';
import BigNumber from './bignumber';
import NETWORKS, { getDecimalChainIdByNetworkType } from './constants/NETWORKS';
import getProvider from './provider';
import { getTokenAddressByNetworkAndSymbol, getTokenDecimalsBySymbol } from './tokens';
import {
    getCollateralConfigBySymbol,
    getCollateralConfigByType,
    getAllCollateralSymbols,
} from './constants/COLLATERALS';
import { getContractAddressByName, getJoinNameByCollateralType } from './contracts';

const EXCHANGE_RATE_CACHE = 20 * 1000;

const getCompleteExchangePathBySymbol = function (symbol: string, useExchangeRoute = true) {
    if (symbol === 'DAI') {
        // no exchange is needed for DAI -> DAI
        return ['DAI'];
    }
    const collateral = getCollateralConfigBySymbol(symbol);
    if (collateral.uniswap.type !== 'token') {
        throw new Error(`"${symbol}" is not a uniswap token`);
    }
    return !useExchangeRoute ? [symbol, 'DAI'] : [symbol, ...collateral.uniswap.route, 'DAI'];
};

const getUniswapRouteAddressesBySymbol = async function (network: string, symbol: string): Promise<string[]> {
    const completeExchangePath = getCompleteExchangePathBySymbol(symbol);

    return await Promise.all(
        completeExchangePath.map(exchangePathSymbol => getTokenAddressByNetworkAndSymbol(network, exchangePathSymbol))
    );
};

export const getUniswapParametersByCollateral = async function (
    network: string,
    collateralType: string,
    profitAddress: string
): Promise<string> {
    const collateral = getCollateralConfigByType(collateralType);
    // TODO: properly calculate minimum profit value
    const minProfit = 0;
    const joinAdapterAddress = await getContractAddressByName(network, getJoinNameByCollateralType(collateralType));
    if (collateral.uniswap.type === 'token') {
        const typesArray = ['address', 'address', 'uint256', 'address[]'];
        return ethers.utils.defaultAbiCoder.encode(typesArray, [
            profitAddress,
            joinAdapterAddress,
            minProfit,
            await getUniswapRouteAddressesBySymbol(network, collateral.symbol),
        ]);
    }
    if (collateral.uniswap.type === 'lpToken') {
        const typesArray = ['address', 'address', 'uint256', 'address[]', 'address[]'];
        return ethers.utils.defaultAbiCoder.encode(typesArray, [
            profitAddress,
            joinAdapterAddress,
            minProfit,
            await getUniswapRouteAddressesBySymbol(network, collateral.uniswap.token0),
            await getUniswapRouteAddressesBySymbol(network, collateral.uniswap.token1),
        ]);
    }
    throw new Error(`unexpected collateral type "${collateralType}"`);
};

export const getUniswapCalleeBySymbol = function (network: string, symbol: string): string | undefined {
    const collateral = getCollateralConfigBySymbol(symbol);
    if (collateral.uniswap.type === 'token') {
        return NETWORKS[network].uniswapV2CalleeDaiAddress;
    }
    if (collateral.uniswap.type === 'lpToken') {
        return NETWORKS[network].uniswapV2LpTokenCalleeDaiAddress;
    }
    throw new Error(`token of this type doesn't exist`);
};

const getUniswapTokenBySymbol = async function (network: string, symbol: string): Promise<Token> {
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
    const provider = getProvider(network);
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

const splitArrayIntoPairs = function (array: string[]): string[][] {
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

const getLpTokenTotalSupply = async function (network: string, symbol: string): Promise<BigNumber> {
    const provider = getProvider(network);
    const address = await getTokenAddressByNetworkAndSymbol(network, symbol);
    const contract = new ethers.Contract(address, uniswapV2PairABI, provider);
    const totalSupply = await contract.totalSupply();
    const collateral = getCollateralConfigBySymbol(symbol);
    return new BigNumber(totalSupply.toString()).shiftedBy(-collateral.decimals);
};

const getTotalPriceInDai = async function (
    network: string,
    reserve: TokenAmount,
    portionOfTheTotalSupply: BigNumber
): Promise<BigNumber> {
    if (!reserve.token.symbol) {
        throw new Error(`reserve.token.symbol is not defined`);
    }
    const amountInThePool = new BigNumber(reserve.toFixed(reserve.token.decimals));
    const amountOwned = amountInThePool.multipliedBy(portionOfTheTotalSupply);
    const tokenExchangeRate = await getRegularTokenExchangeRateBySymbol(network, reserve.token.symbol, amountOwned);
    return tokenExchangeRate.multipliedBy(amountOwned);
};

const getLpTokenExchangeRateBySymbol = async function (
    network: string,
    symbol: string,
    amount: BigNumber
): Promise<BigNumber> {
    const collateral = getCollateralConfigBySymbol(symbol);
    if (collateral.uniswap.type !== 'lpToken') {
        throw new Error(`"${collateral.symbol}" is not a UniSwap LP token`);
    }
    const uniswapPair = await getUniswapPairBySymbols(network, collateral.uniswap.token0, collateral.uniswap.token1);
    const totalSupply = await getLpTokenTotalSupply(network, symbol);
    const portionOfTheTotalSupply = amount.div(totalSupply);
    const totalPriceOfToken0 = await getTotalPriceInDai(
        network,
        uniswapPair.reserveOf(await getUniswapTokenBySymbol(network, collateral.uniswap.token0)),
        portionOfTheTotalSupply
    );
    const totalPriceOfToken1 = await getTotalPriceInDai(
        network,
        uniswapPair.reserveOf(await getUniswapTokenBySymbol(network, collateral.uniswap.token1)),
        portionOfTheTotalSupply
    );
    const totalPrice = totalPriceOfToken0.plus(totalPriceOfToken1);
    return totalPrice.dividedBy(amount);
};

const getRegularTokenExchangeRateBySymbol = async function (
    network: string,
    symbol: string,
    amount: BigNumber
): Promise<BigNumber> {
    /* 
        More info on how UniSwap works and other available methods can be found here:
        https://www.quicknode.com/guides/defi/how-to-interact-with-uniswap-using-javascript#interacting-with-uniswap
    */
    if (symbol === 'DAI') {
        // exchnage rate between DAI and DAI is always 1
        return new BigNumber(1);
    }
    const collateral = getCollateralConfigBySymbol(symbol);
    if (collateral.uniswap.type !== 'token') {
        throw new Error(`"${collateral.symbol}" is not an UniSwap token`);
    }
    const completeExchangePath = getCompleteExchangePathBySymbol(symbol);
    const pairs = splitArrayIntoPairs(completeExchangePath);
    const uniswapPairs = await Promise.all(pairs.map(pair => getUniswapPairBySymbols(network, pair[0], pair[1])));
    const exchangeToken = await getUniswapTokenBySymbol(network, symbol);
    const uniswapRoute = new Route(uniswapPairs, exchangeToken);
    const uniswapTrade = new Trade(
        uniswapRoute,
        new TokenAmount(exchangeToken, amount.shiftedBy(collateral.decimals).toFixed(0)),
        TradeType.EXACT_INPUT
    );
    return new BigNumber(uniswapTrade.executionPrice.toSignificant(collateral.decimals));
};

export const getExchangeRateBySymbol = async function (
    network: string,
    symbol: string,
    amount: BigNumber = new BigNumber('1')
): Promise<BigNumber> {
    const collateral = getCollateralConfigBySymbol(symbol);
    if (collateral.uniswap.type === 'token') {
        return await getRegularTokenExchangeRateBySymbol(network, symbol, amount);
    }
    if (collateral.uniswap.type === 'lpToken') {
        return await getLpTokenExchangeRateBySymbol(network, symbol, amount);
    }
    throw new Error(`"${symbol}" is not a uniswap token`);
};

export const checkAllExchangeRates = async function (network: string): Promise<void> {
    const errors = [];
    const successes = [];
    for (const symbol of getAllCollateralSymbols()) {
        try {
            const marketUnitPrice = await getExchangeRateBySymbol(network, symbol);
            successes.push(symbol);
            console.info('getAllExchangeRates', symbol, marketUnitPrice.toString());
        } catch (error) {
            errors.push(symbol);
            console.error('getAllExchangeRates error', symbol, error);
        }
    }
    console.info('getAllExchangeRates finished, could not fetch symbols:', errors, successes);
};

/* 
    Most of the uniswap logic based on the `auction-demo-keeper` source code
    https://github.com/makerdao/auction-demo-keeper/blob/main/src/clipper.js#L134-L160
*/
import { ethers } from 'ethers';
import BigNumber from 'bignumber.js';
import { Fetcher, Token, Route, Pair, Trade, TokenAmount, TradeType } from '@uniswap/sdk';
import NETWORKS, { getDecimalChainIdByNetworkType } from '~/lib/constants/NETWORKS';
import {
    getCollateralConfigBySymbol,
    getCollateralConfigByType,
    getAllCollateralSymbols,
} from '~/lib/constants/COLLATERALS';
import { getTokenAddressByNetworkAndSymbol, getTokenDecimalsBySymbol } from '~/lib/tokens';
import getWallet from '~/lib/wallet';
import getMaker from '~/lib/maker';

const providers: Record<string, ethers.providers.JsonRpcProvider> = {};

const getProvider = function (network: string): ethers.providers.JsonRpcProvider {
    if (!providers[network]) {
        const networkUrl = NETWORKS[network].url;
        providers[network] = new ethers.providers.JsonRpcProvider(networkUrl);
    }
    return providers[network];
};

const getCompleteExchangePathBySymbol = function (symbol: string, useExchangeRoute: boolean = true) {
    const collateral = getCollateralConfigBySymbol(symbol);
    if (collateral.uniswap.type !== 'token') {
        throw new Error(`"${symbol}" is not a uniswap token`);
    }
    return !useExchangeRoute ? [symbol, 'DAI'] : [symbol, ...collateral.uniswap.route, 'DAI'];
};

const getUniswapRouteAddressesBySymbol = function (network: string, symbol: string): string[] {
    const completeExchangePath = getCompleteExchangePathBySymbol(symbol);
    return completeExchangePath.map(exchangePathSymbol =>
        getTokenAddressByNetworkAndSymbol(network, exchangePathSymbol)
    );
};

export const getUniswapParametersByCollateral = async function (
    network: string,
    collateralType: string
): Promise<string> {
    const maker = await getMaker();
    const wallet = getWallet();
    const collateral = getCollateralConfigByType(collateralType);
    // TODO: properly calculate minimum profit value
    const minProfit = 0;
    const joinAdapterAddress = maker.service('liquidation')._joinGemAdapter(collateralType).address;
    if (collateral.uniswap.type === 'token') {
        const typesArray = ['address', 'address', 'uint256', 'address[]'];
        return ethers.utils.defaultAbiCoder.encode(typesArray, [
            wallet.address,
            joinAdapterAddress,
            minProfit,
            getUniswapRouteAddressesBySymbol(network, collateral.symbol),
        ]);
    }
    if (collateral.uniswap.type === 'lpToken') {
        const typesArray = ['address', 'address', 'uint256', 'address[]', 'address[]'];
        return ethers.utils.defaultAbiCoder.encode(typesArray, [
            wallet.address,
            joinAdapterAddress,
            minProfit,
            getUniswapRouteAddressesBySymbol(network, collateral.uniswap.token0),
            getUniswapRouteAddressesBySymbol(network, collateral.uniswap.token1),
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
};

const getUniswapTokenBySymbol = function (network: string, symbol: string): Token {
    const tokenAddress = getTokenAddressByNetworkAndSymbol(network, symbol);
    const tokenDecimals = getTokenDecimalsBySymbol(symbol);
    const decimalChainId = getDecimalChainIdByNetworkType(network);
    return new Token(decimalChainId, tokenAddress, tokenDecimals, symbol);
};

const getUniswapPairBySymbols = async function (network: string, symbol1: string, symbol2: string): Promise<Pair> {
    const provider = getProvider(network);
    const token1 = getUniswapTokenBySymbol(network, symbol1);
    const token2 = getUniswapTokenBySymbol(network, symbol2);
    try {
        return await Fetcher.fetchPairData(token1, token2, provider);
    } catch (error) {
        throw new Error(`The pair of "${symbol1}/${symbol2}" is not tradable on UniSwap "${network}" network`);
    }
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

export const getExchangeRateBySymbol = async function (
    network: string,
    symbol: string,
    amount: BigNumber = new BigNumber('1')
): Promise<BigNumber> {
    /* 
        More info on how it works and other available numbers can be found here:
        https://www.quicknode.com/guides/defi/how-to-interact-with-uniswap-using-javascript#interacting-with-uniswap
    */
    const collateral = getCollateralConfigBySymbol(symbol);
    if (collateral.uniswap.type !== 'token') {
        throw new Error(`"${symbol}" is not a uniswap token`);
    }
    const completeExchangePath = getCompleteExchangePathBySymbol(symbol);
    const pairs = splitArrayIntoPairs(completeExchangePath);
    const uniswapPairs = await Promise.all(pairs.map(pair => getUniswapPairBySymbols(network, pair[0], pair[1])));
    const exchangeToken = getUniswapTokenBySymbol(network, symbol);
    const uniswapRoute = new Route(uniswapPairs, exchangeToken);
    const uniswapTrade = new Trade(
        uniswapRoute,
        new TokenAmount(exchangeToken, amount.shiftedBy(collateral.decimals).toFixed(0)),
        TradeType.EXACT_INPUT
    );
    return new BigNumber(uniswapTrade.executionPrice.toSignificant(collateral.decimals));
};

export const checkAllExchangeRates = async function (network: string): Promise<void> {
    const errors = [];
    const successes = [];
    for (const symbol of getAllCollateralSymbols()) {
        try {
            const marketPricePerCollateral = await getExchangeRateBySymbol(network, symbol);
            successes.push(symbol);
            console.info('getAllExchangeRates', symbol, marketPricePerCollateral.toString());
        } catch (error) {
            errors.push(symbol);
            console.error('getAllExchangeRates error', symbol, error);
        }
    }
    console.info('getAllExchangeRates finished, could not fetch symbols:', errors, successes);
};

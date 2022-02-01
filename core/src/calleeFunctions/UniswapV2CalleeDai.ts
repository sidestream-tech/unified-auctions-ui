import type { CalleeFunctions, CollateralConfig } from '../types';
import { ethers } from 'ethers';
import { Route, Trade, TokenAmount, TradeType } from '@uniswap/sdk';
import BigNumber from '../bignumber';
import { getContractAddressByName, getJoinNameByCollateralType } from '../contracts';
import {
    getUniswapRouteAddressesBySymbol,
    getCompleteExchangePathBySymbol,
    splitArrayIntoPairs,
    getUniswapPairBySymbols,
    getUniswapTokenBySymbol,
} from './helpers/uniswapV2';

const getCalleeData = async function (
    network: string,
    collateral: CollateralConfig,
    profitAddress: string
): Promise<string> {
    if (collateral.exchange.callee !== 'UniswapV2CalleeDai') {
        throw new Error(`getCalleeData called with invalid collateral type "${collateral.ilk}"`);
    }
    const joinAdapterAddress = await getContractAddressByName(network, getJoinNameByCollateralType(collateral.ilk));
    const minProfit = 0;
    const typesArray = ['address', 'address', 'uint256', 'address[]'];
    return ethers.utils.defaultAbiCoder.encode(typesArray, [
        profitAddress,
        joinAdapterAddress,
        minProfit,
        await getUniswapRouteAddressesBySymbol(network, collateral.symbol),
    ]);
};

const getMarketPrice = async function (
    network: string,
    collateral: CollateralConfig,
    amount: BigNumber
): Promise<BigNumber> {
    /* 
        More info on how UniSwap works and other available methods can be found here:
        https://www.quicknode.com/guides/defi/how-to-interact-with-uniswap-using-javascript#interacting-with-uniswap
    */
    if (collateral.exchange.callee !== 'UniswapV2CalleeDai') {
        throw new Error(`"${collateral.symbol}" is not an UniSwap token`);
    }
    const completeExchangePath = getCompleteExchangePathBySymbol(collateral.symbol);
    const pairs = splitArrayIntoPairs(completeExchangePath);
    const uniswapPairs = await Promise.all(pairs.map(pair => getUniswapPairBySymbols(network, pair[0], pair[1])));
    const exchangeToken = await getUniswapTokenBySymbol(network, collateral.symbol);
    const uniswapRoute = new Route(uniswapPairs, exchangeToken);
    const uniswapTrade = new Trade(
        uniswapRoute,
        new TokenAmount(exchangeToken, amount.shiftedBy(collateral.decimals).toFixed(0)),
        TradeType.EXACT_INPUT
    );
    return new BigNumber(uniswapTrade.executionPrice.toSignificant(collateral.decimals));
};

const UniswapV2CalleeDai: CalleeFunctions = {
    getCalleeData,
    getMarketPrice,
};

export default UniswapV2CalleeDai;

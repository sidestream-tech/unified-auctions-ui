import type { CalleeFunctions, CollateralConfig, Pool } from '../types';
import { ethers } from 'ethers';
import BigNumber from '../bignumber';
import { getContractAddressByName, getJoinNameByCollateralType } from '../contracts';
import { convertCollateralToDaiUsingPool, encodePools, getRouteAndGasQuote } from './helpers/uniswapV3';
import { getPools } from '.';
import { routeToPool } from './helpers/pools';

const getCalleeData = async function (
    network: string,
    collateral: CollateralConfig,
    marketId: string,
    profitAddress: string,
    preloadedPools?: Pool[]
): Promise<string> {
    const marketData = collateral.exchanges[marketId];
    if (marketData?.callee !== 'UniswapV3Callee') {
        throw new Error(`getCalleeData called with invalid collateral type "${collateral.ilk}"`);
    }
    const pools = preloadedPools || (await getPools(network, collateral, marketId));
    if (!pools) {
        throw new Error(`getCalleeData called with invalid pools`);
    }
    const joinAdapterAddress = await getContractAddressByName(network, getJoinNameByCollateralType(collateral.ilk));
    const minProfit = 1;
    const uniswapV3pools = await encodePools(network, pools);
    const typesArray = ['address', 'address', 'uint256', 'bytes', 'address'];
    return ethers.utils.defaultAbiCoder.encode(typesArray, [
        profitAddress,
        joinAdapterAddress,
        minProfit,
        uniswapV3pools,
        ethers.constants.AddressZero,
    ]);
};

const getMarketPrice = async function (
    network: string,
    collateral: CollateralConfig,
    marketId: string,
    collateralAmount: BigNumber
): Promise<{ price: BigNumber; pools: Pool[] }> {
    const { route, fees, totalPrice } = await getRouteAndGasQuote(
        network,
        collateral.symbol,
        collateralAmount,
        marketId
    );
    if (!route) {
        throw new Error(`No route found for ${collateral.symbol} to DAI`);
    }
    const pools = await routeToPool(network, route, collateral.symbol, fees);
    const daiAmount =
        totalPrice ||
        (await convertCollateralToDaiUsingPool(network, collateral.symbol, marketId, collateralAmount, pools));

    // return price per unit
    return { price: daiAmount.dividedBy(collateralAmount), pools: pools };
};

const UniswapV2CalleeDai: CalleeFunctions = {
    getCalleeData,
    getMarketPrice,
};

export default UniswapV2CalleeDai;

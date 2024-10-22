import type { CalleeFunctions, CollateralConfig, GetCalleeDataParams, Pool } from '../types';
import { ethers } from 'ethers';
import BigNumber from '../bignumber';
import { getContractAddressByName, getJoinNameByCollateralType } from '../contracts';
import { convertCollateralToDaiUsingPool, encodePools } from './helpers/uniswapV3';
import { getPools } from '.';
import { routeToPool } from './helpers/pools';
import { fetchAutoRouteInformation } from './helpers/uniswapAutoRouter';

const getCalleeData = async function (
    network: string,
    collateral: CollateralConfig,
    marketId: string,
    profitAddress: string,
    params?: GetCalleeDataParams
): Promise<string> {
    const marketData = collateral.exchanges[marketId];
    if (marketData?.callee !== 'UniswapV3Callee') {
        throw new Error(`getCalleeData called with invalid collateral type "${collateral.ilk}"`);
    }
    const joinName = getJoinNameByCollateralType(collateral.ilk);
    if (!joinName) {
        throw new Error(`collateral "${collateral.ilk}" does not have join contract`);
    }
    const preloadedPools = !!params && 'pools' in params ? params.pools : undefined;
    const pools = preloadedPools || (await getPools(network, collateral, marketId));
    if (!pools) {
        throw new Error(`getCalleeData called with invalid pools`);
    }
    const joinAdapterAddress = await getContractAddressByName(network, joinName);
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
    const calleeConfig = collateral.exchanges[marketId];
    const isAutorouted = 'automaticRouter' in calleeConfig;
    if (calleeConfig?.callee !== 'UniswapV3Callee') {
        throw new Error(`getCalleeData called with invalid collateral type "${collateral.ilk}"`);
    }
    const { route, fees, totalPriceAdjusted, pools } = isAutorouted
        ? await fetchAutoRouteInformation(network, collateral.symbol, collateralAmount.toFixed())
        : {
              route: calleeConfig.route,
              fees: undefined,
              pools: undefined,
              totalPriceAdjusted: undefined,
          };

    if (!pools && route) {
        const generatedPools = await routeToPool(network, route, collateral.symbol, fees);
        const daiAmount = await convertCollateralToDaiUsingPool(
            network,
            collateral.symbol,
            marketId,
            collateralAmount,
            generatedPools
        );
        return { price: daiAmount.dividedBy(collateralAmount), pools: generatedPools };
    }
    if (totalPriceAdjusted && pools) {
        return { price: totalPriceAdjusted.dividedBy(collateralAmount), pools: pools };
    }
    throw new Error(`Failed to compute market data due to lack of information`);
};

const UniswapV2CalleeDai: CalleeFunctions = {
    getCalleeData,
    getMarketPrice,
};

export default UniswapV2CalleeDai;

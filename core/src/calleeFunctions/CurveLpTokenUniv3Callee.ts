import type { CalleeFunctions, CollateralConfig, GetCalleeDataParams, Pool } from '../types';
import { ethers } from 'ethers';
import BigNumber from '../bignumber';
import { getContractAddressByName, getJoinNameByCollateralType } from '../contracts';
import { convertCrvethToEth, CURVE_COIN_INDEX, CURVE_POOL_ADDRESS } from './helpers/curve';
import { convertCollateralToDai, encodePools } from './helpers/uniswapV3';
import { routeToPool } from './helpers/pools';

export const CHARTER_MANAGER_ADDRESS = '0x8377CD01a5834a6EaD3b7efb482f678f2092b77e';

const getCalleeData = async function (
    network: string,
    collateral: CollateralConfig,
    marketId: string,
    profitAddress: string,
    params?: GetCalleeDataParams
): Promise<string> {
    const marketData = collateral.exchanges[marketId];
    if (marketData?.callee !== 'CurveLpTokenUniv3Callee') {
        throw new Error(`Can not encode route for the "${collateral.ilk}"`);
    }
    const preloadedPools = !!params && 'pools' in params ? params.pools : undefined;
    if (!preloadedPools) {
        throw new Error(`Can not encode route for the "${collateral.ilk}" without preloaded pools`);
    }
    const joinName = getJoinNameByCollateralType(collateral.ilk);
    if (!joinName) {
        throw new Error(`Collateral "${collateral.ilk}" does not have join contract`);
    }
    const joinAdapterAddress = await getContractAddressByName(network, joinName);
    const route = await encodePools(network, preloadedPools);
    const curveData = [CURVE_POOL_ADDRESS, CURVE_COIN_INDEX];
    const minProfit = 1;
    const typesArray = ['address', 'address', 'uint256', 'bytes', 'address', 'tuple(address,uint256)'];
    return ethers.utils.defaultAbiCoder.encode(typesArray, [
        profitAddress,
        joinAdapterAddress,
        minProfit,
        route,
        CHARTER_MANAGER_ADDRESS,
        curveData,
    ]);
};

const getMarketPrice = async function (
    network: string,
    collateral: CollateralConfig,
    marketId: string,
    collateralAmount: BigNumber
): Promise<{ price: BigNumber; pools: Pool[] }> {
    const marketData = collateral.exchanges[marketId];
    if (marketData.callee !== 'CurveLpTokenUniv3Callee') {
        throw new Error(`Can not get market price for the "${collateral.ilk}"`);
    }
    // convert stETH into ETH
    const wethAmount = await convertCrvethToEth(network, collateralAmount);

    // convert ETH into DAI
    const daiAmount = await convertCollateralToDai(network, 'ETH', wethAmount);

    // return price per unit
    return {
        price: daiAmount.dividedBy(collateralAmount),
        pools: await routeToPool(network, marketData.route, collateral.symbol),
    };
};

const CurveLpTokenUniv3Callee: CalleeFunctions = {
    getCalleeData,
    getMarketPrice,
};

export default CurveLpTokenUniv3Callee;

import { ethers } from 'ethers';
import type { CalleeFunctions, CollateralConfig, GetCalleeDataParams, Pool } from '../types';
import BigNumber from '../bignumber';
import { getContractAddressByName, getJoinNameByCollateralType } from '../contracts';
import { convertCollateralToDai, encodePools } from './helpers/uniswapV3';
import { convertStethToEth } from './helpers/curve';
import { convertRethToWsteth } from './helpers/rocket';
import { convertWstethToSteth } from './helpers/wsteth';
import { NULL_ADDRESS } from '../constants/UNITS';
import { routeToPool } from './helpers/pools';

const getCalleeData = async function (
    network: string,
    collateral: CollateralConfig,
    marketId: string,
    profitAddress: string,
    params?: GetCalleeDataParams
): Promise<string> {
    const calleeConfig = collateral.exchanges[marketId];
    if (calleeConfig?.callee !== 'rETHCurveUniv3Callee') {
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
    const route = await encodePools(network, preloadedPools.slice(1));
    const joinAdapterAddress = await getContractAddressByName(network, joinName);
    const minProfit = 1;
    const typesArray = ['address', 'address', 'uint256', 'bytes', 'address'];
    return ethers.utils.defaultAbiCoder.encode(typesArray, [
        profitAddress,
        joinAdapterAddress,
        minProfit,
        route,
        NULL_ADDRESS,
    ]);
};

const getMarketPrice = async function (
    network: string,
    collateral: CollateralConfig,
    marketId: string,
    collateralAmount: BigNumber
): Promise<{ price: BigNumber; pools: Pool[] }> {
    const marketData = collateral.exchanges[marketId];
    if (marketData.callee !== 'rETHCurveUniv3Callee') {
        throw new Error(`Can not get market price for the "${collateral.ilk}"`);
    }
    // convert rETH into wstETH
    const wstethAmount = await convertRethToWsteth(network, collateralAmount);

    // convert wstETH into stETH (unwrap)
    const stethAmount = await convertWstethToSteth(network, wstethAmount);

    // convert stETH into ETH
    const ethAmount = await convertStethToEth(network, stethAmount);

    // convert ETH into DAI
    const daiAmount = await convertCollateralToDai(network, 'ETH', ethAmount);

    // return price per unit
    return {
        price: daiAmount.dividedBy(collateralAmount),
        pools: await routeToPool(network, marketData.route, collateral.symbol),
    };
};

const rETHCurveUniv3Callee: CalleeFunctions = {
    getCalleeData,
    getMarketPrice,
};

export default rETHCurveUniv3Callee;

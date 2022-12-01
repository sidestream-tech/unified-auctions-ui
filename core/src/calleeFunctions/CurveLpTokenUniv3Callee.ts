import type { CalleeFunctions, CollateralConfig, Pool } from '../types';
import { ethers } from 'ethers';
import BigNumber from '../bignumber';
import { getContractAddressByName, getJoinNameByCollateralType } from '../contracts';
import { convertCrvethToEth, CURVE_COIN_INDEX, CURVE_POOL_ADDRESS } from './helpers/curve';
import { convertCollateralToDai, encodePools } from './helpers/uniswapV3';

export const CHARTER_MANAGER_ADDRESS = '0x8377CD01a5834a6EaD3b7efb482f678f2092b77e';

const getCalleeData = async function (
    network: string,
    collateral: CollateralConfig,
    marketId: string,
    profitAddress: string,
    preloadedPools?: Pool[]
): Promise<string> {
    const marketData = collateral.exchanges[marketId];
    if (marketData?.callee !== 'CurveLpTokenUniv3Callee') {
        throw new Error(`Can not encode route for the "${collateral.ilk}"`);
    }
    if (!preloadedPools) {
        throw new Error(`Can not encode route for the "${collateral.ilk}" without preloaded pools`);
    }
    const route = await encodePools(network, preloadedPools);
    const curveData = [CURVE_POOL_ADDRESS, CURVE_COIN_INDEX];
    const joinAdapterAddress = await getContractAddressByName(network, getJoinNameByCollateralType(collateral.ilk));
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
    _collateral: CollateralConfig,
    _marketId: string,
    collateralAmount: BigNumber
): Promise<BigNumber> {
    // convert stETH into ETH
    const wethAmount = await convertCrvethToEth(network, collateralAmount);

    // convert ETH into DAI
    const daiAmount = await convertCollateralToDai(network, 'ETH', wethAmount);

    // return price per unit
    return daiAmount.dividedBy(collateralAmount);
};

const CurveLpTokenUniv3Callee: CalleeFunctions = {
    getCalleeData,
    getMarketPrice,
};

export default CurveLpTokenUniv3Callee;

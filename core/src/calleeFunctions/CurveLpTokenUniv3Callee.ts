import type { CalleeFunctions, CollateralConfig, FormattedCalleeData } from '../types';
import { ethers } from 'ethers';
import BigNumber from '../bignumber';
import { getContractAddressByName, getJoinNameByCollateralType } from '../contracts';
import { convertCrvethToEth, CURVE_COIN_INDEX, CURVE_POOL_ADDRESS } from './helpers/curve';
import { encodeRoute, convertCollateralToDai } from './helpers/uniswapV3';

export const CHARTER_MANAGER_ADDRESS = '0x8377CD01a5834a6EaD3b7efb482f678f2092b77e';

const TYPES_ARRAY = ['address', 'address', 'uint256', 'bytes', 'address', 'tuple(address,uint256)'];

const getCalleeData = async function (
    network: string,
    collateral: CollateralConfig,
    profitAddress: string
): Promise<string> {
    if (collateral.exchange.callee !== 'CurveLpTokenUniv3Callee') {
        throw new Error(`Can not encode route for the "${collateral.ilk}"`);
    }
    const route = await encodeRoute(network, collateral.exchange.route);
    const curveData = [CURVE_POOL_ADDRESS, CURVE_COIN_INDEX];
    const joinAdapterAddress = await getContractAddressByName(network, getJoinNameByCollateralType(collateral.ilk));
    const minProfit = 1;
    return ethers.utils.defaultAbiCoder.encode(TYPES_ARRAY, [
        profitAddress,
        joinAdapterAddress,
        minProfit,
        route,
        CHARTER_MANAGER_ADDRESS,
        curveData,
    ]);
};

const decodeCalleeData = function (calleeData: string): FormattedCalleeData | undefined {
    const decodedData = ethers.utils.defaultAbiCoder.decode(TYPES_ARRAY, calleeData);

    if (!decodedData) {
        return;
    }
    return {
        profitAddress: decodedData[0],
        joinAdapterAddress: decodedData[1],
        minProfit: decodedData[2],
    };
};

const getMarketPrice = async function (
    network: string,
    _collateral: CollateralConfig,
    collateralAmount: BigNumber
): Promise<BigNumber> {
    // convert stETH into ETH
    const wethAmount = await convertCrvethToEth(network, collateralAmount);

    // convert ETH into DAI
    const daiAmount = await convertCollateralToDai(network, 'ETH', wethAmount);

    // return price per unit
    return daiAmount.dividedBy(collateralAmount);
};

const UniswapV2CalleeDai: CalleeFunctions = {
    getCalleeData,
    decodeCalleeData,
    getMarketPrice,
};

export default UniswapV2CalleeDai;

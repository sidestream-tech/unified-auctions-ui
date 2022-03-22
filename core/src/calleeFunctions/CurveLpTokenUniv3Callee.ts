import type { CalleeFunctions, CollateralConfig } from '../types';
import { ethers } from 'ethers';
import BigNumber from '../bignumber';
import { getContractAddressByName, getJoinNameByCollateralType } from '../contracts';
import { convertStethToETH, CURVE_COIN_INDEX, CURVE_POOL_ADDRESS } from './helpers/curve';
import { encodeRoute } from './helpers/uniswapV3';
import { convertCollateralToDAI } from './helpers/uniswapV3';

const getCalleeData = async function (
    network: string,
    collateral: CollateralConfig,
    profitAddress: string
): Promise<string> {
    const route = encodeRoute(network, collateral);
    const curveData = [CURVE_POOL_ADDRESS, CURVE_COIN_INDEX];
    const joinAdapterAddress = await getContractAddressByName(network, getJoinNameByCollateralType(collateral.ilk));
    const minProfit = 0;
    const typesArray = ['address', 'address', 'uint256', 'bytes', 'address', 'tuple(address,uint256)'];
    return ethers.utils.defaultAbiCoder.encode(typesArray, [
        profitAddress,
        joinAdapterAddress,
        minProfit,
        route,
        ethers.constants.AddressZero,
        curveData,
    ]);
};

const getMarketPrice = async function (
    network: string,
    _collateral: CollateralConfig,
    collateralAmount: BigNumber
): Promise<BigNumber> {
    // convert stETH into ETH
    const wethAmount = await convertStethToETH(network, collateralAmount);

    // convert ETH into DAI
    const daiAmount = await convertCollateralToDAI(network, 'ETH', wethAmount);

    // return price per unit
    return daiAmount.dividedBy(collateralAmount);
};

const UniswapV2CalleeDai: CalleeFunctions = {
    getCalleeData,
    getMarketPrice,
};

export default UniswapV2CalleeDai;

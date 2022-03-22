import type { CalleeFunctions, CollateralConfig } from '../types';
import { ethers } from 'ethers';
import BigNumber from '../bignumber';
import { getContractAddressByName, getJoinNameByCollateralType } from '../contracts';
import { convertCrvethToEth, CURVE_COIN_INDEX, CURVE_POOL_ADDRESS } from './helpers/curve';
import { encodeRoute, convertCollateralToDai } from './helpers/uniswapV3';

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
    const wethAmount = await convertCrvethToEth(network, collateralAmount);

    // convert ETH into DAI
    const daiAmount = await convertCollateralToDai(network, 'ETH', wethAmount);

    // return price per unit
    return daiAmount.dividedBy(collateralAmount);
};

const UniswapV2CalleeDai: CalleeFunctions = {
    getCalleeData,
    getMarketPrice,
};

export default UniswapV2CalleeDai;

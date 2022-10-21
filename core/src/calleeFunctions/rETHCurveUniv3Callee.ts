import type { CalleeFunctions, CollateralConfig } from '../types';
import { ethers } from 'ethers';
import BigNumber from '../bignumber';
import { getContractAddressByName, getJoinNameByCollateralType } from '../contracts';
import { encodeRoute, convertCollateralToDai } from './helpers/uniswapV3';
import { convertStethToEth } from './helpers/curve';
import { convertRethToWsteth } from './helpers/rocket';
import { convertWstethToSteth } from './helpers/wsteth';

export const CHARTER_MANAGER_ADDRESS = '0x8377CD01a5834a6EaD3b7efb482f678f2092b77e';

const getCalleeData = async function (
    network: string,
    collateral: CollateralConfig,
    profitAddress: string
): Promise<string> {
    if (collateral.exchange.callee !== 'rETHCurveUniv3Callee') {
        throw new Error(`Can not encode route for the "${collateral.ilk}"`);
    }
    const route = await encodeRoute(network, collateral.exchange.route);
    const joinAdapterAddress = await getContractAddressByName(network, getJoinNameByCollateralType(collateral.ilk));
    const minProfit = 1;
    const typesArray = ['address', 'address', 'uint256', 'bytes', 'address'];
    return ethers.utils.defaultAbiCoder.encode(typesArray, [
        profitAddress,
        joinAdapterAddress,
        minProfit,
        route,
        CHARTER_MANAGER_ADDRESS,
    ]);
};

const getMarketPrice = async function (
    network: string,
    _collateral: CollateralConfig,
    collateralAmount: BigNumber
): Promise<BigNumber> {
    // convert rETH into wstETH
    const wstethAmount = await convertRethToWsteth(network, collateralAmount);

    // convert wstETH into stETH (unwrap)
    const stethAmount = await convertWstethToSteth(network, wstethAmount);

    // convert stETH into ETH
    const ethAmount = await convertStethToEth(network, stethAmount);

    // convert ETH into DAI
    const daiAmount = await convertCollateralToDai(network, 'ETH', ethAmount);

    // return price per unit
    return daiAmount.dividedBy(collateralAmount);
};

const rETHCurveUniv3Callee: CalleeFunctions = {
    getCalleeData,
    getMarketPrice,
};

export default rETHCurveUniv3Callee;

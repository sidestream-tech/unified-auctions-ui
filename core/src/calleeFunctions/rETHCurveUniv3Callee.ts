import { ethers } from 'ethers';
import type { CalleeFunctions, CollateralConfig } from '../types';
import BigNumber from '../bignumber';
import { getContractAddressByName, getJoinNameByCollateralType } from '../contracts';
import { encodeRoute, convertCollateralToDai } from './helpers/uniswapV3';
import { convertStethToEth } from './helpers/curve';
import { convertRethToWsteth } from './helpers/rocket';
import { convertWstethToSteth } from './helpers/wsteth';
import { NULL_ADDRESS } from '../constants/UNITS';

const getCalleeData = async function (
    network: string,
    collateral: CollateralConfig,
    marketId: string,
    profitAddress: string
): Promise<string> {
    const marketData = collateral.exchanges[marketId];
    if (marketData?.callee !== 'rETHCurveUniv3Callee') {
        throw new Error(`Can not encode route for the "${collateral.ilk}"`);
    }
    const route = await encodeRoute(network, marketData.route);
    const joinAdapterAddress = await getContractAddressByName(network, getJoinNameByCollateralType(collateral.ilk));
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
    _collateral: CollateralConfig,
    _marketId: string,
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

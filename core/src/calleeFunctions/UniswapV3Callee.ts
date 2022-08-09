import type { CalleeFunctions, CollateralConfig, FormattedCalleeData } from '../types';
import { ethers } from 'ethers';
import BigNumber from '../bignumber';
import { getContractAddressByName, getJoinNameByCollateralType } from '../contracts';
import { convertCollateralToDaiUsingRoute, encodeRoute } from './helpers/uniswapV3';

const TYPES_ARRAY = ['address', 'address', 'uint256', 'bytes', 'address'];

const getCalleeData = async function (
    network: string,
    collateral: CollateralConfig,
    profitAddress: string
): Promise<string> {
    if (collateral.exchange.callee !== 'UniswapV3Callee') {
        throw new Error(`getCalleeData called with invalid collateral type "${collateral.ilk}"`);
    }
    const joinAdapterAddress = await getContractAddressByName(network, getJoinNameByCollateralType(collateral.ilk));
    const minProfit = 1;
    const uniswapV3route = await encodeRoute(network, [collateral.symbol, ...collateral.exchange.route]);
    return ethers.utils.defaultAbiCoder.encode(TYPES_ARRAY, [
        profitAddress,
        joinAdapterAddress,
        minProfit,
        uniswapV3route,
        ethers.constants.AddressZero,
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
    collateral: CollateralConfig,
    collateralAmount: BigNumber
): Promise<BigNumber> {
    // convert collateral into DAI
    const daiAmount = await convertCollateralToDaiUsingRoute(network, collateral.symbol, collateralAmount);

    // return price per unit
    return daiAmount.dividedBy(collateralAmount);
};

const UniswapV2CalleeDai: CalleeFunctions = {
    getCalleeData,
    decodeCalleeData,
    getMarketPrice,
};

export default UniswapV2CalleeDai;

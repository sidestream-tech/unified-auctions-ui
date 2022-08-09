import type { CalleeFunctions, CollateralConfig, FormattedCalleeData } from '../types';
import { ethers } from 'ethers';
import BigNumber from '../bignumber';
import getContract, { getContractAddressByName, getJoinNameByCollateralType } from '../contracts';
import { ETH_NUMBER_OF_DIGITS } from '../constants/UNITS';
import { convertStethToEth } from './helpers/curve';
import { convertCollateralToDai, UNISWAP_FEE } from './helpers/uniswapV3';

const TYPES_ARRAY = ['address', 'address', 'uint256', 'uint24', 'address'];

const getCalleeData = async function (
    network: string,
    collateral: CollateralConfig,
    profitAddress: string
): Promise<string> {
    const joinAdapterAddress = await getContractAddressByName(network, getJoinNameByCollateralType(collateral.ilk));
    const minProfit = 1;
    return ethers.utils.defaultAbiCoder.encode(TYPES_ARRAY, [
        profitAddress,
        joinAdapterAddress,
        minProfit,
        UNISWAP_FEE,
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
    // convert wstETH into stETH
    const collateralContract = await getContract(network, collateral.symbol);
    const collateralIntegerAmount = collateralAmount.shiftedBy(collateral.decimals).toFixed(0);
    const stethIntegerAmount = await collateralContract.getStETHByWstETH(collateralIntegerAmount);
    const stethAmount = new BigNumber(stethIntegerAmount._hex).shiftedBy(-ETH_NUMBER_OF_DIGITS);

    // convert stETH into ETH
    const ethAmount = await convertStethToEth(network, stethAmount);

    // convert ETH into DAI
    const daiAmount = await convertCollateralToDai(network, 'ETH', ethAmount);

    // return price per unit
    return daiAmount.dividedBy(collateralAmount);
};

const UniswapV2CalleeDai: CalleeFunctions = {
    getCalleeData,
    decodeCalleeData,
    getMarketPrice,
};

export default UniswapV2CalleeDai;

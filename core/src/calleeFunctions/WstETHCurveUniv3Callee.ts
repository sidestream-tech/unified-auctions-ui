import type { CalleeFunctions, CollateralConfig } from '../types';
import { ethers } from 'ethers';
import BigNumber from '../bignumber';
import getContract, { getContractAddressByName, getJoinNameByCollateralType } from '../contracts';
import { ETH_NUMBER_OF_DIGITS } from '../constants/UNITS';
import { convertStethToEth } from './helpers/curve';
import { convertCollateralToDai, UNISWAP_FEE } from './helpers/uniswapV3';

const getCalleeData = async function (
    network: string,
    collateral: CollateralConfig,
    profitAddress: string
): Promise<string> {
    const joinAdapterAddress = await getContractAddressByName(network, getJoinNameByCollateralType(collateral.ilk));
    const minProfit = 0;
    const typesArray = ['address', 'address', 'uint256', 'uint24', 'address'];
    return ethers.utils.defaultAbiCoder.encode(typesArray, [
        profitAddress,
        joinAdapterAddress,
        minProfit,
        UNISWAP_FEE,
        ethers.constants.AddressZero,
    ]);
};

const getMarketPrice = async function (
    network: string,
    collateral: CollateralConfig,
    collateralAmount: BigNumber,
    blockTag?: string | number
): Promise<BigNumber> {
    // convert wstETH into stETH
    const collateralContract = await getContract(network, collateral.symbol);
    const collateralIntegerAmount = collateralAmount.shiftedBy(collateral.decimals).toFixed(0);
    const stethIntegerAmount = await collateralContract.getStETHByWstETH(collateralIntegerAmount, { blockTag });
    const stethAmount = new BigNumber(stethIntegerAmount._hex).shiftedBy(-ETH_NUMBER_OF_DIGITS);

    // convert stETH into ETH
    const ethAmount = await convertStethToEth(network, stethAmount);

    // convert ETH into DAI
    const daiAmount = await convertCollateralToDai(network, 'ETH', ethAmount, blockTag);

    // return price per unit
    return daiAmount.dividedBy(collateralAmount);
};

const UniswapV2CalleeDai: CalleeFunctions = {
    getCalleeData,
    getMarketPrice,
};

export default UniswapV2CalleeDai;

import type { CalleeFunctions, CollateralConfig } from '../types';
import { ethers } from 'ethers';
import BigNumber from '../bignumber';
import { getContractAddressByName, getJoinNameByCollateralType } from '../contracts';
import { convertStethToEth } from './helpers/curve';
import { convertCollateralToDai, UNISWAP_FEE } from './helpers/uniswapV3';
import { convertWstethToSteth } from './helpers/wsteth';

const getCalleeData = async function (
    network: string,
    collateral: CollateralConfig,
    profitAddress: string
): Promise<string> {
    const joinAdapterAddress = await getContractAddressByName(network, getJoinNameByCollateralType(collateral.ilk));
    const minProfit = 1;
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
    collateralAmount: BigNumber
): Promise<BigNumber> {
    if (!collateral.exchanges.hasOwnProperty('Curve wstETH V3')) {
        throw new Error(`Invalid callee used to get market price for ${collateral.ilk}`);
    }
    // convert wstETH into stETH
    const stethAmount = await convertWstethToSteth(network, collateralAmount);

    // convert stETH into ETH
    const ethAmount = await convertStethToEth(network, stethAmount);

    // convert ETH into DAI
    const daiAmount = await convertCollateralToDai(network, 'ETH', ethAmount);

    // return price per unit
    return daiAmount.dividedBy(collateralAmount);
};

const UniswapV2CalleeDai: CalleeFunctions = {
    getCalleeData,
    getMarketPrice,
};

export default UniswapV2CalleeDai;

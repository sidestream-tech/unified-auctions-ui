import type { CalleeFunctions, CollateralConfig, GetCalleeDataParams } from '../types';
import { ethers } from 'ethers';
import BigNumber from '../bignumber';
import { getContractAddressByName, getJoinNameByCollateralType } from '../contracts';
import { getOneInchQuote } from './helpers/oneInch';
import { WAD_NUMBER_OF_DIGITS } from '../constants/UNITS';

const getCalleeData = async function (
    network: string,
    collateral: CollateralConfig,
    marketId: string,
    profitAddress: string,
    params?: GetCalleeDataParams
): Promise<string> {
    const marketData = collateral.exchanges[marketId];
    if (marketData?.callee !== 'OneInchCallee') {
        throw new Error(`getCalleeData called with invalid collateral type "${collateral.ilk}"`);
    }
    const oneInchParams = !!params && 'oneInchParams' in params ? params.oneInchParams : undefined;
    if (!oneInchParams) {
        throw new Error(`getCalleeData called with invalid txData`);
    }
    const joinAdapterAddress = await getContractAddressByName(network, getJoinNameByCollateralType(collateral.ilk));
    const minProfit = 1;
    const typesArray = ['address', 'address', 'uint256', 'address', 'address', 'bytes'];
    return ethers.utils.defaultAbiCoder.encode(typesArray, [
        profitAddress,
        joinAdapterAddress,
        minProfit,
        ethers.constants.AddressZero,
        oneInchParams.to,
        oneInchParams.txData,
    ]);
};

const getMarketPrice = async function (
    network: string,
    collateral: CollateralConfig,
    marketId: string,
    collateralAmount: BigNumber
): Promise<{ price: BigNumber; pools: undefined }> {
    // convert collateral into DAI
    const collateralAmountWad = collateralAmount.shiftedBy(WAD_NUMBER_OF_DIGITS).toFixed(0);
    const { tokenOut } = await getOneInchQuote(network, collateral.symbol, collateralAmountWad, marketId);

    // return price per unit
    return { price: new BigNumber(tokenOut).dividedBy(collateralAmountWad), pools: undefined };
};

const UniswapV2CalleeDai: CalleeFunctions = {
    getCalleeData,
    getMarketPrice,
};

export default UniswapV2CalleeDai;

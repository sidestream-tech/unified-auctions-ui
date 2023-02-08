import type { CalleeFunctions, CollateralConfig, Pool } from '../types';
import { ethers } from 'ethers';
import BigNumber from '../bignumber';
import { getContractAddressByName, getJoinNameByCollateralType } from '../contracts';
import { getOneInchQuote } from './helpers/oneInch';

const getCalleeData = async function (
    network: string,
    collateral: CollateralConfig,
    marketId: string,
    profitAddress: string,
    params?: { pools?: Pool[]; oneInchParams?: {txData: string; to: string} }
): Promise<string> {
    const marketData = collateral.exchanges[marketId];
    if (marketData?.callee !== 'OneInchCallee') {
        throw new Error(`getCalleeData called with invalid collateral type "${collateral.ilk}"`);
    }
    if (!params || !params.oneInchParams) {
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
        params.oneInchParams.to,
        params.oneInchParams.txData
    ]);
};

const getMarketPrice = async function (
    network: string,
    collateral: CollateralConfig,
    marketId: string,
    collateralAmount: BigNumber
): Promise<{price: BigNumber; pools: undefined}> {
    // convert collateral into DAI
    const { tokenOut } = await getOneInchQuote(network, collateral.symbol, collateralAmount.toFixed(), marketId);

    // return price per unit
    return {price: new BigNumber(tokenOut).dividedBy(collateralAmount), pools: undefined};
};

const UniswapV2CalleeDai: CalleeFunctions = {
    getCalleeData,
    getMarketPrice,
};

export default UniswapV2CalleeDai;

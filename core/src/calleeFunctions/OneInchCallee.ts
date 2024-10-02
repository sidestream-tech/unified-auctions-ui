import type { CalleeFunctions, CollateralConfig, GetCalleeDataParams } from '../types';
import { ethers } from 'ethers';
import BigNumber from '../bignumber';
import { getContractAddressByName, getJoinNameByCollateralType } from '../contracts';
import { getOneinchSwapParameters } from './helpers/oneInch';
import { DAI_NUMBER_OF_DIGITS } from '../constants/UNITS';

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
    const joinName = getJoinNameByCollateralType(collateral.ilk);
    if (!joinName) {
        throw new Error(`Collateral "${collateral.ilk}" does not have join contract`);
    }
    const joinAdapterAddress = await getContractAddressByName(network, joinName);
    const minProfit = 1;
    const typesArray = ['address', 'address', 'uint256', 'address', 'address', 'bytes'];
    return ethers.utils.defaultAbiCoder.encode(typesArray, [
        profitAddress,
        joinAdapterAddress,
        minProfit,
        ethers.constants.AddressZero,
        oneInchParams.to,
        ethers.utils.hexDataSlice(oneInchParams.txData, 4),
    ]);
};

const getMarketPrice = async function (
    network: string,
    collateral: CollateralConfig,
    marketId: string,
    collateralAmount: BigNumber
): Promise<{ price: BigNumber; pools: undefined }> {
    // convert collateral into DAI
    const collateralIntegerAmount = collateralAmount.shiftedBy(collateral.decimals).toFixed(0);
    const { toTokenAmount } = await getOneinchSwapParameters(
        network,
        collateral.symbol,
        collateralIntegerAmount,
        marketId
    );

    // return price per unit
    return {
        price: new BigNumber(toTokenAmount).shiftedBy(-DAI_NUMBER_OF_DIGITS).dividedBy(collateralAmount),
        pools: undefined,
    };
};

const UniswapV2CalleeDai: CalleeFunctions = {
    getCalleeData,
    getMarketPrice,
};

export default UniswapV2CalleeDai;

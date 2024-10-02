import type { CalleeFunctions, CollateralConfig, Pool } from '../types';
import { ethers } from 'ethers';
import BigNumber from '../bignumber';
import { getContractAddressByName, getJoinNameByCollateralType } from '../contracts';
import { convertStethToEth } from './helpers/curve';
import { convertCollateralToDai, UNISWAP_FEE } from './helpers/uniswapV3';
import { convertWstethToSteth } from './helpers/wsteth';
import { routeToPool } from './helpers/pools';

const getCalleeData = async function (
    network: string,
    collateral: CollateralConfig,
    _marketId: string,
    profitAddress: string
): Promise<string> {
    const joinName = getJoinNameByCollateralType(collateral.ilk);
    if (!joinName) {
        throw new Error(`Collateral "${collateral.ilk}" does not have join contract`);
    }
    const joinAdapterAddress = await getContractAddressByName(network, joinName);
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
    marketId: string,
    collateralAmount: BigNumber
): Promise<{ price: BigNumber; pools: Pool[] }> {
    const marketData = collateral.exchanges[marketId];
    if (marketData?.callee !== 'WstETHCurveUniv3Callee') {
        throw new Error(`Invalid callee used to get market price for ${collateral.ilk}`);
    }
    // convert wstETH into stETH
    const stethAmount = await convertWstethToSteth(network, collateralAmount);

    // convert stETH into ETH
    const ethAmount = await convertStethToEth(network, stethAmount);

    // convert ETH into DAI
    const daiAmount = await convertCollateralToDai(network, 'ETH', ethAmount);

    // return price per unit
    return {
        price: daiAmount.dividedBy(collateralAmount),
        pools: await routeToPool(network, marketData.route, collateral.symbol),
    };
};

const UniswapV2CalleeDai: CalleeFunctions = {
    getCalleeData,
    getMarketPrice,
};

export default UniswapV2CalleeDai;

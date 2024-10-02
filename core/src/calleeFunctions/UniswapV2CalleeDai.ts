import type { CalleeFunctions, CollateralConfig, Pool } from '../types';
import { ethers } from 'ethers';
import BigNumber from '../bignumber';
import { getContractAddressByName, getJoinNameByCollateralType } from '../contracts';
import { getUniswapRouteAddressesBySymbol, getRegularTokenExchangeRateBySymbol } from './helpers/uniswapV2';
import { routeToPool } from './helpers/pools';

const getCalleeData = async function (
    network: string,
    collateral: CollateralConfig,
    marketId: string,
    profitAddress: string
): Promise<string> {
    const marketData = collateral.exchanges[marketId];
    if (marketData?.callee !== 'UniswapV2CalleeDai') {
        throw new Error(`getCalleeData called with invalid collateral type "${collateral.ilk}"`);
    }
    const joinName = getJoinNameByCollateralType(collateral.ilk);
    if (!joinName) {
        throw new Error(`Collateral "${collateral.ilk}" does not have join contract`);
    }
    const joinAdapterAddress = await getContractAddressByName(network, joinName);
    const minProfit = 1;
    const typesArray = ['address', 'address', 'uint256', 'address[]'];
    return ethers.utils.defaultAbiCoder.encode(typesArray, [
        profitAddress,
        joinAdapterAddress,
        minProfit,
        await getUniswapRouteAddressesBySymbol(network, collateral.symbol, marketId),
    ]);
};

const getMarketPrice = async function (
    network: string,
    collateral: CollateralConfig,
    marketId: string,
    amount: BigNumber
): Promise<{ price: BigNumber; pools: Pool[] }> {
    const marketData = collateral.exchanges[marketId];
    if (marketData.callee !== 'UniswapV2CalleeDai') {
        throw new Error(`Can not get market price for the "${collateral.ilk}"`);
    }
    return {
        price: await getRegularTokenExchangeRateBySymbol(network, collateral.symbol, marketId, amount),
        pools: await routeToPool(network, marketData.route, collateral.symbol),
    };
};

const UniswapV2CalleeDai: CalleeFunctions = {
    getCalleeData,
    getMarketPrice,
};

export default UniswapV2CalleeDai;

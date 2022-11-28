import { ethers } from 'ethers';
import { abi as UNISWAP_V3_QUOTER_ABI } from '@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json';
import BigNumber from '../../bignumber';
import getProvider from '../../provider';
import { DAI_NUMBER_OF_DIGITS, MKR_NUMBER_OF_DIGITS } from '../../constants/UNITS';
import { getCollateralConfigBySymbol } from '../../constants/COLLATERALS';
import { getTokenAddressByNetworkAndSymbol } from '../../tokens';
import { CollateralSymbol, Pool } from '../../types';
import { routeToPool } from './pools';
import { fetchAutoRouteInformation } from './uniswapAutoRouter';

const UNISWAP_V3_QUOTER_ADDRESS = '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6';
export const UNISWAP_FEE = 3000; // denominated in hundredths of a bip

const getUniswapV3quoterContract = async function (network: string): Promise<ethers.Contract> {
    const provider = await getProvider(network);
    return new ethers.Contract(UNISWAP_V3_QUOTER_ADDRESS, UNISWAP_V3_QUOTER_ABI, provider);
};

export const encodePools = async function (_network: string, pools: Pool[]): Promise<string> {
    const types = [] as string[];
    const values = [] as Array<string | number>;

    for (const pool of pools) {
        types.push('address');
        values.push(pool.addresses[0]);

        types.push('uint24');
        values.push(pool.fee);
    }
    types.push('address');
    values.push(pools[pools.length - 1].addresses[1]);
    return ethers.utils.solidityPack(types, values);
};

const getRouteAndGasQuote = async (
    network: string,
    collateralSymbol: CollateralSymbol,
    collateralAmount: BigNumber,
    marketId: string
) => {
    const collateral = getCollateralConfigBySymbol(collateralSymbol);
    const calleeConfig = collateral.exchanges[marketId];
    const isAutorouted = 'automaticRouter' in calleeConfig;
    if (calleeConfig?.callee !== 'UniswapV3Callee') {
        throw new Error(`getCalleeData called with invalid collateral type "${collateral.ilk}"`);
    }
    if (isAutorouted) {
        const { route, quoteGasAdjusted, fees } = await fetchAutoRouteInformation(
            network,
            collateralSymbol,
            collateralAmount.toFixed()
        );
        return { route, quoteGasAdjusted, fees };
    } else {
        return { route: [collateral.symbol, ...calleeConfig.route], quoteGasAdjusted: undefined, fees: undefined };
    }
};

export const convertCollateralToDaiUsingPool = async function (
    network: string,
    collateralSymbol: string,
    marketId: string,
    collateralAmount: BigNumber
): Promise<BigNumber> {
    const collateral = getCollateralConfigBySymbol(collateralSymbol);
    const calleeConfig = collateral.exchanges[marketId];
    if (calleeConfig?.callee !== 'UniswapV3Callee') {
        throw new Error(`getCalleeData called with invalid collateral type "${collateral.ilk}"`);
    }
    const collateralIntegerAmount = collateralAmount.shiftedBy(collateral.decimals).toFixed(0);
    const { route, fees } = await getRouteAndGasQuote(network, collateralSymbol, collateralAmount, marketId);
    if (!route) {
        throw new Error(`No route found for ${collateralSymbol} to DAI`);
    }
    const pools = await routeToPool(network, route, fees);
    const encodedPools = await encodePools(network, pools);
    const uniswapV3quoterContract = await getUniswapV3quoterContract(network);
    const daiIntegerAmount = await uniswapV3quoterContract.callStatic.quoteExactInput(
        encodedPools,
        collateralIntegerAmount
    );
    const daiAmount = new BigNumber(daiIntegerAmount._hex).shiftedBy(-DAI_NUMBER_OF_DIGITS);
    return daiAmount;
};

export const convertSymbolToDai = async function (
    network: string,
    symbol: string,
    amount: BigNumber,
    decimals: number
): Promise<BigNumber> {
    const integerAmount = amount.shiftedBy(decimals).toFixed(0);
    const uniswapV3quoterContract = await getUniswapV3quoterContract(network);
    const daiIntegerAmount = await uniswapV3quoterContract.callStatic.quoteExactInputSingle(
        await getTokenAddressByNetworkAndSymbol(network, symbol),
        await getTokenAddressByNetworkAndSymbol(network, 'MCD_DAI'),
        UNISWAP_FEE,
        integerAmount,
        0
    );
    const daiAmount = new BigNumber(daiIntegerAmount._hex).shiftedBy(-DAI_NUMBER_OF_DIGITS);
    return daiAmount;
};

export const convertDaiToSymbol = async function (
    network: string,
    symbol: string,
    amount: BigNumber,
    decimals: number
): Promise<BigNumber> {
    const integerAmount = amount.shiftedBy(decimals).toFixed(0);
    const uniswapV3quoterContract = await getUniswapV3quoterContract(network);
    const daiIntegerAmount = await uniswapV3quoterContract.callStatic.quoteExactInputSingle(
        await getTokenAddressByNetworkAndSymbol(network, 'MCD_DAI'),
        await getTokenAddressByNetworkAndSymbol(network, symbol),
        UNISWAP_FEE,
        integerAmount,
        0
    );
    const daiAmount = new BigNumber(daiIntegerAmount._hex).shiftedBy(-DAI_NUMBER_OF_DIGITS);
    return daiAmount;
};

export const convertCollateralToDai = async function (
    network: string,
    collateralSymbol: string,
    collateralAmount: BigNumber
): Promise<BigNumber> {
    const collateral = getCollateralConfigBySymbol(collateralSymbol);
    return await convertSymbolToDai(network, collateralSymbol, collateralAmount, collateral.decimals);
};

export const convertMkrToDai = async function (network: string, amountDai: BigNumber): Promise<BigNumber> {
    return await convertSymbolToDai(network, 'MCD_GOV', amountDai, MKR_NUMBER_OF_DIGITS);
};

export const convertDaiToMkr = async function (network: string, amount: BigNumber): Promise<BigNumber> {
    return await convertDaiToSymbol(network, 'MCD_GOV', amount, MKR_NUMBER_OF_DIGITS);
};

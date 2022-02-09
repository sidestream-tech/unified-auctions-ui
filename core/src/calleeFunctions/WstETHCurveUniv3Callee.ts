import type { CalleeFunctions, CollateralConfig } from '../types';
import { ethers } from 'ethers';
import BigNumber from '../bignumber';
import getContract, { getContractAddressByName, getJoinNameByCollateralType } from '../contracts';
import getProvider from '../provider';
import CURVE_POOL_ABI from '../abis/CURVE_POOL.json';
import { abi as UNISWAP_V3_QUOTER_ABI } from '@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json';
import { DAI_NUMBER_OF_DIGITS } from '../constants/UNITS';

const CURVE_POOL_ADDRESS = '0xDC24316b9AE028F1497c275EB9192a3Ea0f67022';
const UNISWAP_V3_QUOTER_ADDRESS = '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6';
const UNISWAP_FEE = 3000; // denominated in hundredths of a bip

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
    amount: BigNumber
): Promise<BigNumber> {
    // convert wstETH into stETH
    const collateralContract = await getContract(network, collateral.symbol);
    const collateralIntegerAmount = amount.shiftedBy(collateral.decimals).toFixed(0);
    const stethIntegerAmount = await collateralContract.getStETHByWstETH(collateralIntegerAmount);

    // convert stETH into ETH
    const provider = await getProvider(network);
    const curvePoolContract = await new ethers.Contract(
        CURVE_POOL_ADDRESS,
        CURVE_POOL_ABI as ethers.ContractInterface,
        provider
    );
    const wethIntegerAmount = await curvePoolContract.get_dy(1, 0, stethIntegerAmount);

    // get uniswap quotes
    const uniswapV3quoterContract = await new ethers.Contract(
        UNISWAP_V3_QUOTER_ADDRESS,
        UNISWAP_V3_QUOTER_ABI,
        provider
    );
    const daiIntegerAmount = await uniswapV3quoterContract.callStatic.quoteExactInputSingle(
        await getContractAddressByName(network, 'ETH'),
        await getContractAddressByName(network, 'MCD_DAI'),
        UNISWAP_FEE,
        wethIntegerAmount,
        0
    );
    const daiAmount = new BigNumber(daiIntegerAmount._hex).shiftedBy(-DAI_NUMBER_OF_DIGITS);

    // return price per unit
    return daiAmount.dividedBy(amount);
};

const UniswapV2CalleeDai: CalleeFunctions = {
    getCalleeData,
    getMarketPrice,
};

export default UniswapV2CalleeDai;

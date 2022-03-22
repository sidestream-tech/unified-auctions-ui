import type { CollateralConfig } from '../../types';
import { ethers } from 'ethers';
import { abi as UNISWAP_V3_QUOTER_ABI } from '@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json';
import BigNumber from '../../bignumber';
import getProvider from '../../provider';
import { getContractAddressByName } from '../../contracts';
import { DAI_NUMBER_OF_DIGITS } from '../../constants/UNITS';
import { getCollateralConfigBySymbol } from '../../constants/COLLATERALS';

const UNISWAP_V3_QUOTER_ADDRESS = '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6';
export const UNISWAP_FEE = 3000; // denominated in hundredths of a bip

export const encodeRoute = async function (network: string, collateral: CollateralConfig): Promise<string> {
    if (collateral.exchange.callee !== 'CurveLpTokenUniv3Callee') {
        throw new Error(`Can not encode route for the "${collateral.ilk}"`);
    }
    const types = ['address'];
    const values = [await getContractAddressByName(network, collateral.symbol)] as any[];

    for (const collateralSymbol of collateral.exchange.route) {
        types.push('uint24');
        values.push(UNISWAP_FEE);

        types.push('address');
        values.push(await getContractAddressByName(network, collateralSymbol));
    }
    return ethers.utils.solidityPack(types, values);
};

export const convertCollateralToDAI = async function (
    network: string,
    collateralSymbol: string,
    collateralAmount: BigNumber
): Promise<BigNumber> {
    const provider = await getProvider(network);
    const uniswapV3quoterContract = await new ethers.Contract(
        UNISWAP_V3_QUOTER_ADDRESS,
        UNISWAP_V3_QUOTER_ABI,
        provider
    );
    const collateral = await getCollateralConfigBySymbol(collateralSymbol);
    const collateralIntegerAmount = collateralAmount.shiftedBy(collateral.decimals).toFixed(0);
    const daiIntegerAmount = await uniswapV3quoterContract.callStatic.quoteExactInputSingle(
        await getContractAddressByName(network, collateralSymbol),
        await getContractAddressByName(network, 'MCD_DAI'),
        UNISWAP_FEE,
        collateralIntegerAmount,
        0
    );
    const daiAmount = new BigNumber(daiIntegerAmount._hex).shiftedBy(-DAI_NUMBER_OF_DIGITS);
    return daiAmount;
};

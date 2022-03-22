import { ethers } from 'ethers';
import BigNumber from '../../bignumber';
import getProvider from '../../provider';
import CURVE_POOL_ABI from '../../abis/CURVE_POOL.json';
import { ETH_NUMBER_OF_DIGITS } from '../../constants/UNITS';

export const CURVE_POOL_ADDRESS = '0xDC24316b9AE028F1497c275EB9192a3Ea0f67022';
export const CURVE_COIN_INDEX = 0;

const getCurvePollContract = async function (network: string): Promise<ethers.Contract> {
    const provider = await getProvider(network);
    return new ethers.Contract(CURVE_POOL_ADDRESS, CURVE_POOL_ABI as ethers.ContractInterface, provider);
};

export const convertStethToETH = async function (network: string, stethAmount: BigNumber): Promise<BigNumber> {
    const curvePoolContract = await getCurvePollContract(network);
    const stethIntegerAmount = stethAmount.shiftedBy(ETH_NUMBER_OF_DIGITS).toFixed(0);
    const wethIntegerAmount = await curvePoolContract.get_dy(1, CURVE_COIN_INDEX, stethIntegerAmount);
    return new BigNumber(wethIntegerAmount._hex).shiftedBy(-ETH_NUMBER_OF_DIGITS);
};

// export const withdrawOneCoin = async function (network: string, stethAmount: BigNumber) {
//     const curvePoolContract = await getCurvePollContract(network);
//     const stethIntegerAmount = stethAmount.shiftedBy(ETH_NUMBER_OF_DIGITS).integerValue();
//     const wethIntegerAmount = await curvePoolContract.calc_withdraw_one_coin(stethIntegerAmount, 0);
//     return new BigNumber(wethIntegerAmount).shiftedBy(-ETH_NUMBER_OF_DIGITS);
// }

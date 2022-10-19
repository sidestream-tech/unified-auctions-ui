import { ethers } from 'ethers';
import BigNumber from '../../bignumber';
import getProvider from '../../provider';
import CURVE_POOL_ABI from '../../abis/CURVE_POOL.json';
import { ETH_NUMBER_OF_DIGITS } from '../../constants/UNITS';

export const ROCKET_POOL_ADDRESS = '0x447Ddd4960d9fdBF6af9a790560d0AF76795CB08';
export const ROCKET_POOL_RETH_INDEX = 0;

const getRocketPoolContract = async function (network: string): Promise<ethers.Contract> {
    const provider = await getProvider(network);
    return new ethers.Contract(ROCKET_POOL_ADDRESS, CURVE_POOL_ABI as ethers.ContractInterface, provider);
};

export const convertRethToWsteth = async function (network: string, rethAmount: BigNumber) {
    const curvePoolContract = await getRocketPoolContract(network);
    const rethIntegerAmount = rethAmount.shiftedBy(ETH_NUMBER_OF_DIGITS).toFixed(0);
    const wstethIntegerAmount = await curvePoolContract.calc_withdraw_one_coin(
        rethIntegerAmount,
        ROCKET_POOL_RETH_INDEX,
        {
            gasLimit: 1000000,
        }
    );
    return new BigNumber(wstethIntegerAmount._hex).shiftedBy(-ETH_NUMBER_OF_DIGITS);
};

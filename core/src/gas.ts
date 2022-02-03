import { ethers } from 'ethers';
import BigNumber from './bignumber';
import { getNetworkConfigByType } from './constants/NETWORKS';
import { ETH_NUMBER_OF_DIGITS } from './constants/UNITS';
import memoizee from 'memoizee';

const API_URL = 'https://ethgasstation.info/json/ethgasAPI.json';
const TRANSACTION_SPEED = 'fast';

const GAS_CACHE = 10 * 60 * 1000;

const _getCurrentGasPrice = async function (): Promise<BigNumber> {
    const gasData = await fetch(API_URL).then(r => r.json());
    const gasPriceString = ethers.utils.formatUnits(gasData[TRANSACTION_SPEED] / 10, 'gwei');
    return new BigNumber(gasPriceString);
};

const getCurrentGasPrice = memoizee(_getCurrentGasPrice, {
    maxAge: GAS_CACHE,
    promise: true,
});

export const getGasPrice = async function (network: string): Promise<BigNumber> {
    const networkConfig = getNetworkConfigByType(network);
    if (networkConfig.gasPrice) {
        return new BigNumber(networkConfig.gasPrice).shiftedBy(-ETH_NUMBER_OF_DIGITS);
    }
    try {
        return await getCurrentGasPrice();
    } catch (error) {
        throw new Error(`Gas data is not available on "${network}" network`);
    }
};

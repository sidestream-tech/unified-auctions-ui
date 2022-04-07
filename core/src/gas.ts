import { ethers } from 'ethers';
import memoizee from 'memoizee';
import BigNumber from './bignumber';
import { getNetworkConfigByType } from './constants/NETWORKS';
import { ETH_NUMBER_OF_DIGITS } from './constants/UNITS';
import CHAINLINK_FAST_GAS_ABI from './abis/CHAINLINK_FAST_GAS.json';
import getProvider from './provider';

const CHAINLINK_FAST_GAS_ADDRESS = '0x169E633A2D1E6c10dD91238Ba11c4A708dfEF37C';
const GAS_CACHE_MS = 10 * 1000;

const _getCurrentGasPrice = async function (network: string): Promise<BigNumber> {
    const provider = await getProvider(network);
    const contract = new ethers.Contract(CHAINLINK_FAST_GAS_ADDRESS, CHAINLINK_FAST_GAS_ABI, provider);
    const gasPrice = await contract.latestAnswer();
    return new BigNumber(gasPrice._hex).shiftedBy(-ETH_NUMBER_OF_DIGITS);
};

const getCurrentGasPrice = memoizee(_getCurrentGasPrice, {
    maxAge: GAS_CACHE_MS,
    promise: true,
    length: 1,
});

export const getGasPrice = async function (network: string): Promise<BigNumber> {
    const networkConfig = getNetworkConfigByType(network);
    if (networkConfig.gasPrice) {
        return new BigNumber(networkConfig.gasPrice).shiftedBy(-ETH_NUMBER_OF_DIGITS);
    }
    try {
        return await getCurrentGasPrice(network);
    } catch (error) {
        throw new Error(`Gas data is not available on "${network}" network`);
    }
};

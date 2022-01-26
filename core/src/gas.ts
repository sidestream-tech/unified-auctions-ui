import { ethers } from 'ethers';
import BigNumber from './bignumber';
import { getNetworkConfigByType } from './constants/NETWORKS';
import { ETH_NUMBER_OF_DIGITS } from './constants/UNITS';

const API_URL = 'https://ethgasstation.info/json/ethgasAPI.json';
const TRANSACTION_SPEED = 'fast';

const getCurrentGasPrice = async function (): Promise<BigNumber> {
    const gasData = await fetch(API_URL).then(r => r.json());
    const gasPriceString = ethers.utils.formatUnits(gasData[TRANSACTION_SPEED] / 10, 'gwei');
    return new BigNumber(gasPriceString);
};

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

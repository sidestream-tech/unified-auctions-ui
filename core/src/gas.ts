import type { GasParameters } from './types';
import memoizee from 'memoizee';
import BigNumber from './bignumber';
import { getNetworkConfigByType } from './constants/NETWORKS';
import { ETH_NUMBER_OF_DIGITS } from './constants/UNITS';
import getProvider from './provider';

const GAS_CACHE_MS = 10 * 1000;

const getEIP1559Values = async function (network: string): Promise<GasParameters> {
    const provider = await getProvider(network);
    const feeData = await provider.getFeeData();
    return {
        maxFeePerGas: feeData.maxFeePerGas?.toString(),
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas?.toString(),
    };
};

export const getGasParametersForTransaction = async function (network: string): Promise<GasParameters> {
    const networkConfig = getNetworkConfigByType(network);
    if (networkConfig.gasPrice) {
        // use hardcoded gasPrice in case it is defined in the network config
        return {
            gasPrice: new BigNumber(networkConfig.gasPrice).toFixed(0),
        };
    }
    // get EIP-1559 values
    return await getEIP1559Values(network);
};

const _getCurrentGasPrice = async function (network: string): Promise<BigNumber> {
    const gasParameters = await getGasParametersForTransaction(network);
    const gasPrice = gasParameters.maxFeePerGas ?? gasParameters.gasPrice;
    if (!gasPrice) {
        return new BigNumber(NaN);
    }
    return new BigNumber(gasPrice).shiftedBy(-ETH_NUMBER_OF_DIGITS);
};

const getCurrentGasPrice = memoizee(_getCurrentGasPrice, {
    maxAge: GAS_CACHE_MS,
    promise: true,
    length: 1,
});

export const getGasPriceForUI = async function (network: string): Promise<BigNumber> {
    const networkConfig = getNetworkConfigByType(network);
    if (networkConfig.gasPrice) {
        return new BigNumber(networkConfig.gasPrice).shiftedBy(-ETH_NUMBER_OF_DIGITS);
    }
    return await getCurrentGasPrice(network);
};

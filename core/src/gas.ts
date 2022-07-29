import type { GasParameters } from './types';
import memoizee from 'memoizee';
import BigNumber from './bignumber';
import { getNetworkConfigByType } from './network';
import { ETH_NUMBER_OF_DIGITS } from './constants/UNITS';
import getProvider from './provider';

const GAS_CACHE_MS = 10 * 1000;
const maxPriorityFeePerGas = new BigNumber(process.env.MAX_PRIORITY_FEE_PER_GAS_WEI || '1500000000').shiftedBy(
    -ETH_NUMBER_OF_DIGITS
);

const _getBaseFeePerGas = async function (network: string): Promise<BigNumber> {
    const provider = await getProvider(network);
    const latestBlock = await provider.getBlock('latest');
    if (!latestBlock?.baseFeePerGas?._hex) {
        return new BigNumber(NaN);
    }
    return new BigNumber(latestBlock?.baseFeePerGas?._hex).shiftedBy(-ETH_NUMBER_OF_DIGITS);
};

export const getBaseFeePerGas = memoizee(_getBaseFeePerGas, {
    maxAge: GAS_CACHE_MS,
    promise: true,
    length: 1,
});

const _getEIP1559Values = async function (network: string): Promise<GasParameters> {
    const baseFeePerGas = await getBaseFeePerGas(network);
    // The formula to compute maxFeePerGas is taken from ethers.js
    // https://github.com/ethers-io/ethers.js/blob/cf47ec5fd5c7e6dda4da499b1c25ac1d1cc84b5a/packages/abstract-provider/src.ts/index.ts#L247-L251
    const maxFeePerGas = baseFeePerGas.multipliedBy(2).plus(maxPriorityFeePerGas);
    return {
        maxPriorityFeePerGas: maxPriorityFeePerGas.shiftedBy(ETH_NUMBER_OF_DIGITS).toFixed(0),
        maxFeePerGas: maxFeePerGas.shiftedBy(ETH_NUMBER_OF_DIGITS).toFixed(0),
    };
};

const getEIP1559Values = memoizee(_getEIP1559Values, {
    maxAge: GAS_CACHE_MS,
    promise: true,
    length: 1,
});

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

export const getGasPriceForUI = async function (network: string): Promise<BigNumber> {
    return (await getBaseFeePerGas(network)).plus(maxPriorityFeePerGas);
};

import type { GasParameters } from './types';
import { ethers } from 'ethers';
import memoizee from 'memoizee';
import BigNumber from './bignumber';
import { getNetworkConfigByType } from './constants/NETWORKS';
import { ETH_NUMBER_OF_DIGITS } from './constants/UNITS';
import CHAINLINK_ORACLE_ABI from './abis/CHAINLINK_FAST_GAS.json';
import getProvider from './provider';

const CHAINLINK_ORACLE_ADDRESS = '0x169e633a2d1e6c10dd91238ba11c4a708dfef37c';
const GAS_CACHE_MS = 10 * 1000;
const maxPriorityFeePerGas = new BigNumber(process.env.MAX_PRIORITY_FEE_PER_GAS_WEI || '1500000000').shiftedBy(
    -ETH_NUMBER_OF_DIGITS
);

export const getBaseFeePerGas = async function (network: string): Promise<BigNumber> {
    const provider = await getProvider(network);
    const pendingBlock = await provider.getBlock('latest');
    if (!pendingBlock?.baseFeePerGas?._hex) {
        return new BigNumber(NaN);
    }
    return new BigNumber(pendingBlock?.baseFeePerGas?._hex).shiftedBy(-ETH_NUMBER_OF_DIGITS);
};

const getOracleGasPrice = async function (network: string): Promise<BigNumber> {
    const provider = await getProvider(network);
    const contract = new ethers.Contract(CHAINLINK_ORACLE_ADDRESS, CHAINLINK_ORACLE_ABI, provider);
    const gasPrice = await contract.latestAnswer();
    return new BigNumber(gasPrice._hex).shiftedBy(-ETH_NUMBER_OF_DIGITS);
};

const _getEIP1559Values = async function (network: string): Promise<GasParameters> {
    const oracleGasPrice = await getOracleGasPrice(network);
    return {
        maxPriorityFeePerGas: maxPriorityFeePerGas.shiftedBy(ETH_NUMBER_OF_DIGITS).toFixed(0),
        maxFeePerGas: oracleGasPrice.plus(maxPriorityFeePerGas).shiftedBy(ETH_NUMBER_OF_DIGITS).toFixed(0),
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
    const gasParameters = await getGasParametersForTransaction(network);
    const anyGasPriceInWei = gasParameters.maxFeePerGas ?? gasParameters.gasPrice;
    if (!anyGasPriceInWei) {
        return new BigNumber(NaN);
    }
    return new BigNumber(anyGasPriceInWei).shiftedBy(-ETH_NUMBER_OF_DIGITS);
};

import type { Notifier } from './types';
import memoizee from 'memoizee';
import getContract from './contracts';
import trackTransaction from './tracker';
import { getGasPrice } from './gas';
import { ETH_NUMBER_OF_DIGITS } from './constants/UNITS';
import { getNetworkConfigByType } from './constants/NETWORKS';

const canTransactionBeConfirmed = function (network: string, confirmTransaction?: boolean) {
    const networkConfig = getNetworkConfigByType(network);
    if (networkConfig.isFork) {
        return false;
    }
    return confirmTransaction;
};

const _executeTransaction = async function (
    network: string,
    contractName: string,
    contractMethod: string,
    contractParameters: any[],
    notifier?: Notifier,
    confirmTransaction?: boolean
): Promise<string> {
    const contract = await getContract(network, contractName, true);
    const gasPrice = await getGasPrice(network);
    const gasPriceWei = gasPrice.shiftedBy(ETH_NUMBER_OF_DIGITS);
    const gasLimit = await contract.estimateGas[contractMethod](...contractParameters, {
        maxPriorityFeePerGas: gasPriceWei.toFixed(0),
        maxFeePerGas: gasPriceWei.multipliedBy(2).toFixed(0),
    });
    const transactionPromise = contract[contractMethod](...contractParameters, {
        gasLimit,
        maxFeePerGas: gasPriceWei.toFixed(0),
    });
    return trackTransaction(transactionPromise, notifier, canTransactionBeConfirmed(network, confirmTransaction));
};

const retriableExecuteTransaction: typeof _executeTransaction = async function (...args): Promise<string> {
    try {
        return await _executeTransaction(...args);
    } catch (error) {
        // retry only nonce-related errors
        if (error instanceof Error && error?.message?.startsWith('nonce has already been used')) {
            console.info('execute: retrying nonce-rejected transaction');
            return retriableExecuteTransaction(...args);
        }
        throw error;
    }
};

const executeTransaction = memoizee(retriableExecuteTransaction, {
    promise: true,
    length: 4,
});

export default executeTransaction;

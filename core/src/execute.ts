import type { Notifier } from './types';
import getContract from './contracts';
import trackTransaction from './tracker';
import { getGasPrice } from './gas';
import { ETH_NUMBER_OF_DIGITS } from './constants/UNITS';
import { getNetworkConfigByType } from './constants/NETWORKS';
import memoizee from 'memoizee';

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
    const transactionPromise = contract[contractMethod](...contractParameters, {
        gasPrice: gasPrice.shiftedBy(ETH_NUMBER_OF_DIGITS).toFixed(),
    });
    return trackTransaction(transactionPromise, notifier, canTransactionBeConfirmed(network, confirmTransaction));
};

const executeTransaction = memoizee(_executeTransaction, {
    promise: true,
    length: 4,
});

export default executeTransaction;

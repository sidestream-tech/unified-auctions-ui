import type { Notifier } from './types';
import getContract from './contracts';
import trackTransaction from './tracker';
import { getGasPrice } from './gas';
import { ETH_NUMBER_OF_DIGITS } from './constants/UNITS';

const executeTransaction = async function (
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
    return trackTransaction(transactionPromise, notifier, confirmTransaction);
};

export default executeTransaction;

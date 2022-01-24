import { ethers } from 'ethers';
import type { Notifier } from './types';
import { v4 as uuidv4 } from 'uuid';

const NUMBER_OF_BLOCKS_TO_VERIFY = 5;

const trackTransaction = async function (
    transactionPromise: Promise<ethers.ContractTransaction>,
    notifier?: Notifier
): Promise<string> {
    const messageId = uuidv4();

    // Display initial message
    if (notifier) {
        notifier('loading', {
            content: 'Transaction is preparing to be mined...',
            key: messageId,
            duration: 0,
        });
    }

    // Wait for the user approval
    let transaction: ethers.ContractTransaction;
    try {
        transaction = await transactionPromise;
        if (notifier) {
            notifier('loading', {
                content: 'Transaction is pending to be mined...',
                key: messageId,
                duration: 0,
            });
        }
    } catch (error: any) {
        if (notifier) {
            notifier('error', {
                content: `Transaction error: ${error?.message || 'unknown'}`,
                key: messageId,
                duration: 3,
            });
        }
        throw new Error(error);
    }

    try {
        // Wait for mining
        const initialTransactionReceipt = await transaction.wait(1);
        if (notifier) {
            notifier('loading', {
                content: `Transaction was mined into block "${initialTransactionReceipt.blockNumber}", confirming...`,
                key: messageId,
                duration: 0,
            });
        }

        // Wait for confirmation
        const confirmedTransactionReceipt = await transaction.wait(NUMBER_OF_BLOCKS_TO_VERIFY);
        if (notifier) {
            notifier('success', {
                content: `Transaction was confirmed in block "${confirmedTransactionReceipt.blockNumber}"`,
                key: messageId,
                duration: 3,
            });
        }
        return confirmedTransactionReceipt.transactionHash;
    } catch (error: any) {
        if (notifier) {
            notifier('error', {
                content: `Transaction was rejected with error: "${error?.message || 'unknown'}"`,
                key: messageId,
                duration: 3,
            });
        }
        throw new Error(error);
    }
};

export default trackTransaction;

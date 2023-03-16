import type { Notifier, MessageContent } from './types';
import { ethers } from 'ethers';
import { v4 as uuidv4 } from 'uuid';
import parseMetamaskError from './helpers/parseMetamaskError';

const DEFAULT_NOTIFICATION_DURATION = 3;
const NUMBER_OF_BLOCKS_TO_CONFIRM = 5;

const defaultNotifier = function (_: string, messageContent: MessageContent) {
    console.info(messageContent.content);
};

const trackTransaction = async function (
    transactionPromise: Promise<ethers.ContractTransaction>,
    notifier: Notifier = defaultNotifier,
    confirmTransaction = true
): Promise<string> {
    const messageId = uuidv4();

    // Display initial message
    notifier('loading', {
        content: 'Transaction is preparing to be mined...',
        key: messageId,
        duration: 0,
    });

    // Wait for the user approval
    let transaction: ethers.ContractTransaction;
    try {
        transaction = await transactionPromise;
        notifier('loading', {
            content: 'Transaction is pending to be mined...',
            key: messageId,
            duration: 0,
        });
    } catch (error: any) {
        notifier('error', {
            content: `Transaction error: "${parseMetamaskError(error?.data?.message || error?.message)}"`,
            key: messageId,
            duration: DEFAULT_NOTIFICATION_DURATION,
        });
        throw error;
    }

    try {
        // Wait for mining
        const minedTransactionReceipt = await transaction.wait(1);
        if (confirmTransaction) {
            notifier('loading', {
                content: `Transaction was mined into block "${minedTransactionReceipt.blockNumber}", confirming...`,
                key: messageId,
                duration: 0,
            });
        } else {
            notifier('success', {
                content: `Transaction was mined into block "${minedTransactionReceipt.blockNumber}"`,
                key: messageId,
                duration: DEFAULT_NOTIFICATION_DURATION,
            });
        }
        if (!confirmTransaction) {
            return minedTransactionReceipt.transactionHash;
        }

        // Wait for confirmation
        const confirmedTransactionReceipt = await transaction.wait(NUMBER_OF_BLOCKS_TO_CONFIRM);
        notifier('success', {
            content: `Transaction was confirmed in block "${confirmedTransactionReceipt.blockNumber}"`,
            key: messageId,
            duration: DEFAULT_NOTIFICATION_DURATION,
        });
        return confirmedTransactionReceipt.transactionHash;
    } catch (error: any) {
        notifier('error', {
            content: `Transaction was rejected with error: "${parseMetamaskError(
                error?.data?.message || error?.message
            )}"`,
            key: messageId,
            duration: DEFAULT_NOTIFICATION_DURATION,
        });
        throw error;
    }
};

export default trackTransaction;

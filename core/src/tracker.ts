import getMaker from './maker';
import { v4 as uuidv4 } from 'uuid';

const trackTransaction = async function (transactionPromise: Promise<any>, notifier?: Notifier): Promise<string> {
    const maker = await getMaker();
    const messageId = uuidv4();
    const transactionManager = maker.service('transactionManager');
    if (notifier) {
        notifier('loading', {
            content: 'Transaction is preparing to be mined...',
            key: messageId,
            duration: 0,
        });
    }
    await new Promise((resolve, reject): void => {
        // check if initial request is not rejected by the user
        transactionPromise.catch((error: Error) => {
            reject(error);
        });
        // track transaction progress
        transactionManager.listen(transactionPromise, {
            pending: () => {
                if (notifier) {
                    notifier('loading', {
                        content: 'Transaction is pending to be mined...',
                        key: messageId,
                        duration: 0,
                    });
                }
            },
            mined: (tx: any) => {
                if (notifier) {
                    notifier('loading', {
                        content: `Transaction was mined into block "${tx?.receipt?.blockNumber}", confirming...`,
                        key: messageId,
                        duration: 0,
                    });
                }
            },
            confirmed: (tx: any) => {
                if (notifier) {
                    notifier('success', {
                        content: `Transaction was confirmed in block "${tx?.receipt?.blockNumber}"`,
                        key: messageId,
                        duration: 3,
                    });
                }
                resolve(tx);
            },
            error: (tx: any) => {
                const errorMessage = tx?.error?.message || 'unknown';
                if (notifier) {
                    notifier('error', {
                        content: `Transaction was rejected with error: "${tx?.error?.message}"`,
                        key: messageId,
                        duration: 3,
                    });
                }
                reject(new Error(errorMessage));
            },
        });
        transactionManager.confirm(transactionPromise);
    });
    const transaction = await transactionPromise;
    return transaction.hash;
};

export default trackTransaction;

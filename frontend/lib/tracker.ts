import { message } from 'ant-design-vue';
import { v4 as uuidv4 } from 'uuid';

const trackTransaction = async function (transactionPromise: Promise<any>, maker: any): Promise<string> {
    const messageId = uuidv4();
    // TODO: we may want to show this message when transaction manager will stil working properly
    // message.loading({ content: 'Preparing to execute transaction...', key: messageId, duration: 0 });
    const transactionManager = maker.service('transactionManager');
    await new Promise((resolve, reject): void => {
        // check if initial request is not rejected by the user
        transactionPromise.catch((error: Error) => reject(error));
        // track transaction progress
        transactionManager.listen(transactionPromise, {
            pending: () => {
                message.loading({ content: 'Transaction is pending to be mined...', key: messageId, duration: 0 });
            },
            mined: (tx: any) => {
                message.loading({
                    content: `Transaction was mined into block "${tx?.receipt?.blockNumber}", confirming...`,
                    key: messageId,
                    duration: 0,
                });
            },
            confirmed: (tx: any) => {
                message.success({
                    content: `Transaction was confirmed in block "${tx?.receipt?.blockNumber}"`,
                    key: messageId,
                    duration: 3,
                });
                resolve(tx);
            },
            error: (tx: any) => {
                const errorMessage = tx?.error?.message || 'unknown';
                message.error({
                    content: `Transaction was rejected with error: "${tx?.error?.message}"`,
                    key: messageId,
                    duration: 3,
                });
                reject(new Error(errorMessage));
            },
        });
        transactionManager.confirm(transactionPromise);
    });
    const transaction = await transactionPromise;
    return transaction.hash;
};

export default trackTransaction;

import { message } from 'ant-design-vue';

const trackTransaction = async function (transaction: Promise<any>, maker: any): Promise<void> {
    const transactionManager = maker.service('transactionManager');
    await new Promise((resolve, reject): void => {
        // check if initial request is not rejected by the user
        transaction.catch((error: Error) => reject(error));
        // track transaction progress
        transactionManager.listen(transaction, {
            pending: (tx: any) => {
                message.loading({ content: 'Transaction is pending to be mined...', key: tx?.hash, duration: 0 });
            },
            mined: (tx: any) => {
                message.loading({
                    content: `Transaction was mined into block "${tx?.receipt?.blockNumber}", confirming...`,
                    key: tx?.hash,
                    duration: 0,
                });
            },
            confirmed: (tx: any) => {
                message.success({
                    content: `Transaction was confirmed in block "${tx?.receipt?.blockNumber}"`,
                    key: tx?.hash,
                    duration: 3,
                });
                resolve(tx);
            },
            error: (tx: any) => {
                const errorMessage = tx?.error?.message || 'unknown';
                message.error({
                    content: `Transaction was rejected with error: "${tx?.error?.message}"`,
                    key: tx?.hash,
                    duration: 3,
                });
                reject(new Error(errorMessage));
            },
        });
        transactionManager.confirm(transaction);
    });
};

export default trackTransaction;

import getProvider from '../provider';
import { ethers } from 'ethers';

const extractEventFromTransaction = async (network: string, transactionHash: string, event: string) => {
    const provider = await getProvider(network);
    const receipt = await provider.getTransactionReceipt(transactionHash);
    const eventLogs = receipt.logs.filter(log => log.topics[0] === ethers.utils.id(event));
    return eventLogs.map(log => ({ topics: log.topics, data: log.data }));
};

export default extractEventFromTransaction;

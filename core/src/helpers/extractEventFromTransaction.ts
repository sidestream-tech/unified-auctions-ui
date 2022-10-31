import { ethers } from 'ethers';

const extractEventFromTransaction = async (transaction: ethers.ContractTransaction, eventSignature: string, contractInterface: ethers.utils.Interface) => {
    const receipt = await transaction.wait();
    const eventLogs = receipt.logs.filter(log => log.topics[0] === ethers.utils.id(eventSignature));
    const filteredLogs = eventLogs.map(log => ({ topics: log.topics, data: log.data }));
    return filteredLogs.map(log => contractInterface.parseLog(log));
};

export default extractEventFromTransaction;

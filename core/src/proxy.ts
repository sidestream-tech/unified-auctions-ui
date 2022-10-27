import getContract from './contracts';
import extractEventFromTransaction from './helpers/extractEventFromTransaction';
import { ethers } from 'ethers';

export const createProxy = async (network: string, proxyOwnerAddress: string) => {
    const proxyFactoryContract = await getContract(network, 'PROXY_FACTORY', true);
    const transaction = await proxyFactoryContract['build(address)'](proxyOwnerAddress);
    const events = await extractEventFromTransaction(
        network,
        transaction.hash,
        'Created(address,address,address,address)'
    );
    if (events.length !== 1) {
        throw new Error("Undexpected number of 'Created' events");
    }
    const proxyAddress = ethers.utils.defaultAbiCoder.decode(['address', 'address'], events[0].data)[0];
    return proxyAddress;
};

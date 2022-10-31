import getContract from './contracts';
import extractEventFromTransaction from './helpers/extractEventFromTransaction';

export const createProxy = async (network: string, proxyOwnerAddress: string) => {
    const proxyFactoryContract = await getContract(network, 'PROXY_FACTORY', true);
    const transaction = await proxyFactoryContract['build(address)'](proxyOwnerAddress);
    const events = await extractEventFromTransaction(
        transaction,
        'Created(address,address,address,address)',
        proxyFactoryContract.interface
    );
    if (events.length !== 1) {
        throw new Error("Undexpected number of 'Created' events");
    }
    const proxyAddress = events[0].args.proxy;
    return proxyAddress;
};

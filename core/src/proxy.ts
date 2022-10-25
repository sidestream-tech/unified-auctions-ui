import getContract from "./contracts";

export const createProxy = async (network: string, proxyOwnerAddress: string) => {
    const proxyFactoryContract = await getContract(network, 'PROXY_FACTORY', true);
    await proxyFactoryContract['build(address)'](proxyOwnerAddress);
    const filter = proxyFactoryContract.filters.Created(null, proxyOwnerAddress, null, null);
    const proxyCreationEvents = await proxyFactoryContract.queryFilter(filter);
    const proxyAddress = proxyCreationEvents[proxyCreationEvents.length - 1].args?.proxy;
    if (!proxyAddress) {
        throw new Error('Failed to detect created DS-Proxy');
    }
    return proxyAddress
}

import { ethers } from 'ethers';
import { getNetworkConfigByType } from './network';

const providers: Record<string, Promise<ethers.providers.JsonRpcProvider>> = {};

export const createProvider = async function (network: string) {
    const networkConfig = getNetworkConfigByType(network);
    const provider = new ethers.providers.StaticJsonRpcProvider({ url: networkConfig.url });
    await provider.ready;
    return provider;
};

export const setProvider = function (network: string, provider: Promise<ethers.providers.JsonRpcProvider>) {
    providers[network] = provider;
};

const getProvider = function (network: string): Promise<ethers.providers.JsonRpcProvider> {
    if (!providers[network]) {
        setProvider(network, createProvider(network));
    }
    return providers[network];
};

export default getProvider;

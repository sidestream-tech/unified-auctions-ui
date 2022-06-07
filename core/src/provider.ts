import { ethers } from 'ethers';
import { getNetworkConfigByType } from './constants/NETWORKS';

const providers: Record<string, Promise<ethers.providers.BaseProvider>> = {};

export const createProvider = async function (network: string, rpcUrl?: string) {
    if (!rpcUrl) {
        const networkConfig = getNetworkConfigByType(network);
        const provider = new ethers.providers.StaticJsonRpcProvider({ url: networkConfig.url });
        await provider.ready;
        return provider;
    }
    const provider = new ethers.providers.StaticJsonRpcProvider({ url: rpcUrl });
    await provider.ready;
    return provider;
};

export const setProvider = function (network: string, provider: Promise<ethers.providers.BaseProvider>) {
    providers[network] = provider;
};

const getProvider = function (network: string, rpcUrl?: string): Promise<ethers.providers.BaseProvider> {
    if (!providers[network]) {
        setProvider(network, createProvider(network, rpcUrl));
    }
    return providers[network];
};

export default getProvider;

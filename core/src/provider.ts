import { ethers } from 'ethers';

const providers: Record<string, Promise<ethers.providers.BaseProvider>> = {};

export const createProvider = async function (rpcURL: string) {
    const provider = new ethers.providers.StaticJsonRpcProvider({ url: rpcURL });
    await provider.ready;
    return provider;
};

export const setProvider = function (network: string, provider: Promise<ethers.providers.BaseProvider>) {
    providers[network] = provider;
};

const getProvider = function (network: string): Promise<ethers.providers.BaseProvider> {
    if (!providers[network]) {
        setProvider(network, createProvider(network));
    }
    return providers[network];
};

export default getProvider;

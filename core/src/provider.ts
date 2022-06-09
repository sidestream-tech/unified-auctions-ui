import { ethers } from 'ethers';
import { getNetworkConfigByType } from './networks';

const providers: Record<string, Promise<ethers.providers.BaseProvider>> = {};

export const createProvider = async function (network: string) {
    const networkConfig = getNetworkConfigByType(network);
    const provider = new ethers.providers.StaticJsonRpcProvider({ url: networkConfig.url });
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

export const getChainIdFromProvider = async function (provider: ethers.providers.BaseProvider) {
    const networkInfo = await provider.getNetwork();
    return `0x${(networkInfo.chainId || 0).toString(16)}`;
};

export default getProvider;

import { ethers } from 'ethers';
import { getNetworkConfigByType } from './constants/NETWORKS';
import { parseURLForInfuraId } from './rpcURL';

const providers: Record<string, Promise<ethers.providers.BaseProvider>> = {};

export const createProvider = async function (network: string) {
    const rpcUrl = process.env.RPC_URL;
    if (!rpcUrl) {
        throw new Error('Please define a RPC URL from which to retrieve network data.');
    }

    const infuraProjectId = parseURLForInfuraId(rpcUrl);

    if (infuraProjectId) {
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

const getProvider = function (network: string): Promise<ethers.providers.BaseProvider> {
    if (!providers[network]) {
        setProvider(network, createProvider(network));
    }
    return providers[network];
};

export default getProvider;

import { ethers } from 'ethers';
//import { parseRPCURLForInfuraId } from './helpers/parseRPCURL';
import { addNetwork } from './networks';

const providers: Record<string, Promise<ethers.providers.BaseProvider>> = {};

export const createProvider = async function () {
    const rpcUrl = process.env.RPC_URL;
    if (!rpcUrl) {
        throw new Error('Please define a RPC URL from which to retrieve network data.');
    }

    // const infuraProjectId = parseRPCURLForInfuraId(rpcUrl);

    const provider = new ethers.providers.StaticJsonRpcProvider({ url: rpcUrl });
    await provider.ready;

    await addNetwork(provider, rpcUrl);

    return provider;
};

export const setProvider = function (network: string, provider: Promise<ethers.providers.BaseProvider>) {
    providers[network] = provider;
};

const getProvider = function (network: string): Promise<ethers.providers.BaseProvider> {
    if (!providers[network]) {
        setProvider(network, createProvider());
    }
    return providers[network];
};

export const getChainIdFromProvider = async function (provider: ethers.providers.BaseProvider) {
    const networkInfo = await provider.getNetwork();
    return `0x${(networkInfo.chainId || 0).toString(16)}`;
};

export default getProvider;

import { ethers } from 'ethers';
import NETWORKS from './constants/NETWORKS';

type Provider = ethers.providers.JsonRpcProvider | ethers.providers.JsonRpcSigner;
const providers: Record<string, Provider> = {};

const getProvider = function (network: string): Provider {
    if (!NETWORKS[network]) {
        throw new Error(`The network "${network}" is not supported yet!`);
    }

    if (!providers[network]) {
        const networkUrl = NETWORKS[network].url;
        providers[network] = new ethers.providers.JsonRpcProvider(networkUrl);
    }
    return providers[network];
};

export const setProvider = function (network: string, provider: Provider) {
    providers[network] = provider;
};

export default getProvider;

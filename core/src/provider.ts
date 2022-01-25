import { ethers } from 'ethers';
import NETWORKS from './constants/NETWORKS';

const providers: Record<string, ethers.providers.BaseProvider> = {};

const getProvider = function (network: string): ethers.providers.BaseProvider {
    if (!NETWORKS[network]) {
        throw new Error(`The network "${network}" is not supported yet!`);
    }

    if (!providers[network]) {
        const networkUrl = NETWORKS[network].url;
        providers[network] = new ethers.providers.JsonRpcProvider(networkUrl);
    }
    return providers[network];
};

export const setProvider = function (network: string, provider: ethers.providers.BaseProvider) {
    providers[network] = provider;
};

export default getProvider;

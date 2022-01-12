import { ethers } from 'ethers';
import NETWORKS from './constants/NETWORKS';

const providers: Record<string, ethers.providers.JsonRpcProvider> = {};

const getProvider = function (network: string): ethers.providers.JsonRpcProvider {
    if (!NETWORKS[network]) {
        throw new Error(`The network "${network}" is not supported yet!`);
    }

    if (!providers[network]) {
        const networkUrl = NETWORKS[network].url;
        providers[network] = new ethers.providers.JsonRpcProvider(networkUrl);
    }
    return providers[network];
};

export default getProvider;

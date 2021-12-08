import { ethers } from 'ethers';
import NETWORKS from '~/lib/constants/NETWORKS';

const providers: Record<string, ethers.providers.JsonRpcProvider> = {};

const getProvider = function (network: string): ethers.providers.JsonRpcProvider {
    if (!providers[network]) {
        const networkUrl = NETWORKS[network].url;
        providers[network] = new ethers.providers.JsonRpcProvider(networkUrl);
    }
    return providers[network];
};

export default getProvider;

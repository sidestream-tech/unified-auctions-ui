import { NetworkConfig } from './types';
import { getChainIdFromProvider } from './provider';
import { getNetworkTitleAndEtherscanURLByChainId } from './constants/NETWORKS';

const networks: Record<string, NetworkConfig> = {};

export const addNetwork = async function (provider: any, rpcURL: string) {
    const chainId = '0x' + ((await getChainIdFromProvider(provider)) || 0).toString(16);
    const networkInfo = getNetworkTitleAndEtherscanURLByChainId(chainId);

    networks[networkInfo?.title || chainId] = {
        chainId: chainId,
        title: networkInfo?.title || chainId,
        url: rpcURL,
        etherscanUrl: networkInfo?.etherscanURL || '',
        isFork: false, // what exactly do we do with this information here and how could I automatically determine it?
    };
};

export const getNetworkConfigByType = function (networkType: string | undefined): NetworkConfig {
    if (!networkType || !networks[networkType]) {
        throw new Error(`No network found with name "${networkType}"`);
    }
    return networks[networkType];
};

export const getDecimalChainIdByNetworkType = function (networkType: string): number {
    const network = networks[networkType];
    if (!network || !network.chainId) {
        throw new Error(`No network with name "${networkType}" can be found`);
    }
    return parseInt(network.chainId, 16);
};

export const getNetworks = function (): Record<string, NetworkConfig> {
    return networks;
};

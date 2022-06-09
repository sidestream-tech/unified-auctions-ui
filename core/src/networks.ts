import { NetworkConfig } from './types';
import { getChainIdFromProvider } from './provider';
import { getNetworkInfoByChainId } from './constants/NETWORKS';
import { ethers } from 'ethers';

const networks: NetworkConfig[] = [];

export const addNetwork = async function (rpcURL: string) {
    const provider = new ethers.providers.StaticJsonRpcProvider({ url: rpcURL });
    await provider.ready;

    const chainId = await getChainIdFromProvider(provider);
    const networkInfo = getNetworkInfoByChainId(chainId);
    const networkTitle = networkInfo?.title || chainId;

    networks.push({
        chainId: chainId,
        title: networkTitle,
        url: rpcURL,
        etherscanUrl: networkInfo?.etherscanURL || '',
        isFork: networkTitle === 'localhost', // TODO: Find a better way to determine if network is a fork.
    });
};

export const getNetworkConfigByType = function (networkType: string | undefined): NetworkConfig {
    const networkConfig = networks.find(network => {
        return network.title === networkType;
    });

    if (!networkType || !networkConfig) {
        throw new Error(`No network found with name "${networkType}"`);
    }
    return networkConfig;
};

export const getDecimalChainIdByNetworkType = function (networkType: string): number {
    const networkConfig = getNetworkConfigByType(networkType);
    if (!networkConfig || !networkConfig.chainId) {
        throw new Error(`No network with name "${networkType}" can be found`);
    }
    return parseInt(networkConfig.chainId, 16);
};

const setupNetworks = async function () {
    const rpcUrl = process.env.RPC_URL;
    if (!rpcUrl) {
        throw new Error(`No "RPC_URL" was defined.`);
    }

    // TODO: Parse if it is a MetaMask URL and add all three MetaMask networks automatically
    await addNetwork(rpcUrl);
    return networks;
};

export default setupNetworks;

import { NetworkConfig } from './types';
import { getChainIdFromProvider } from './provider';
import { getNetworkInfoByChainId } from './constants/NETWORKS';
import { ethers } from 'ethers';

const networks: Record<string, NetworkConfig> = {};

export const addNetwork = async function (rpcURL: string) {
    const provider = new ethers.providers.StaticJsonRpcProvider({ url: rpcURL });
    await provider.ready;

    const chainId = await getChainIdFromProvider(provider);
    const networkInfo = getNetworkInfoByChainId(chainId);
    const networkTitle = networkInfo?.title || chainId;

    networks[networkTitle] = {
        chainId: chainId,
        title: networkTitle,
        url: rpcURL,
        etherscanUrl: networkInfo?.etherscanURL || '',
        isFork: networkTitle === 'localhost', // TODO: Find a better way to determine if network is a fork.
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

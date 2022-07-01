import { NetworkConfig } from './types';
import { getChainIdFromProvider } from './provider';
import { getNetworkInfoByChainId, INFURA_NETWORK_RPCS } from './constants/NETWORKS';
import { ethers } from 'ethers';
import { parseRPCURLForInfuraParameters } from './helpers/parseRPCURL';

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

const addLocalhostNetwork = function () {
    networks['localhost'] = {
        chainId: '0x539',
        title: 'Localhost:8545',
        url: `http://127.0.0.1:8545`,
        etherscanUrl: '',
        isFork: true,
    };
};

export const getNetworkConfigByType = function (networkType: string | undefined): NetworkConfig {
    const networkConfig = networks[networkType ?? ''];
    if (!networkType || !networkConfig) {
        throw new Error(`No network found with name "${networkType}"`);
    }
    return networkConfig;
};

export const getNetworkTypeByChainId = function (chainId: string | undefined): string | undefined {
    const networkEntry = Object.entries(networks).find(([_, networkConfig]) => networkConfig.chainId === chainId);
    return networkEntry && networkEntry[0];
};

export const getDecimalChainIdByNetworkType = function (networkType: string): number {
    const networkConfig = getNetworkConfigByType(networkType);
    if (!networkConfig || !networkConfig.chainId) {
        throw new Error(`No network with name "${networkType}" can be found`);
    }
    return parseInt(networkConfig.chainId, 16);
};

const setupNetworks = async function (rpcUrl?: string, isDev?: boolean) {
    if (!rpcUrl) {
        throw new Error(`No RPC_URL env variable was provided`);
    }

    const { projectId, defaultNetwork } = parseRPCURLForInfuraParameters(rpcUrl);
    if (projectId && defaultNetwork) {
        for (const { url } of INFURA_NETWORK_RPCS) {
            await addNetwork(`${url}/${projectId}`);
        }
    } else {
        await addNetwork(rpcUrl);
    }

    if (isDev) {
        addLocalhostNetwork();
    }

    return { defaultNetwork, networks };
};

export default setupNetworks;

import type { NetworkConfig } from './types';

const networks: Record<string, NetworkConfig> = {};

const SUPPORTED_NETWORKS: NetworkConfig[] = [
    {
        chainId: '0x1',
        type: 'mainnet',
        title: 'Main',
        url: '',
        etherscanUrl: 'https://etherscan.io',
        isFork: false,
    },
    {
        chainId: '0x5',
        type: 'goerli',
        title: 'Goerli',
        url: '',
        etherscanUrl: 'https://goerli.etherscan.io',
        isFork: false,
    },
];

export const getDefaultNetworkConfigs = function (infuraProjectId: string, isDev = false): NetworkConfig[] {
    const infuraNetworksWithProjectId = SUPPORTED_NETWORKS.map(network => ({
        ...network,
        url: `https://${network.type}.infura.io/v3/${infuraProjectId}`,
    }));
    if (!isDev) {
        return infuraNetworksWithProjectId;
    }
    return [
        ...infuraNetworksWithProjectId,
        {
            chainId: '0x539',
            type: 'custom',
            title: 'Localhost:8545',
            url: `http://127.0.0.1:8545`,
            etherscanUrl: '',
            isFork: true,
        },
    ];
};

export const getCustomNetworkConfig = function (rpcUrl: string, chainId: string): NetworkConfig {
    const matchingNetwork = SUPPORTED_NETWORKS.find(n => n.chainId === chainId);
    if (matchingNetwork) {
        return {
            ...matchingNetwork,
            title: `${matchingNetwork.title}-like`,
            url: rpcUrl,
        };
    }
    return {
        chainId,
        type: 'custom',
        title: `Chain ${chainId}`,
        url: rpcUrl,
        etherscanUrl: '',
        isFork: true,
    };
};

export const getNetworks = function (): NetworkConfig[] {
    return Object.values(networks);
};

export const setNetwork = function (networkConfig: NetworkConfig): void {
    networks[networkConfig.type] = networkConfig;
};

const NETWORK_TITLES: Record<string, string | undefined> = {
    // full list can be found on https://chainlist.org
    '0x1': 'mainnet',
    '0x5': 'goerli',
    '0x539': 'custom',
};

export const getNetworkConfigByType = function (networkType: string | undefined): NetworkConfig {
    if (!networkType || !networks[networkType]) {
        throw new Error(`No network found with name "${networkType}"`);
    }
    return networks[networkType];
};

export const getDecimalChainIdByNetworkType = function (networkType: string): number {
    const network = getNetworkConfigByType(networkType);
    if (!network.chainId) {
        throw new Error(`No chainId found for the networ "${networkType}"`);
    }
    return parseInt(network.chainId, 16);
};

export const getActualDecimalChainIdByNetworkType = function (networkType: string): number {
    const network = getNetworkConfigByType(networkType);
    if (network.isFork) {
        // TODO: come up with the better way to detect "actual" chain id
        // currently we assume that if it's a fork, then it's a fork of the mainnet
        return 1;
    }
    return getDecimalChainIdByNetworkType(networkType);
};

export const getChainIdByNetworkType = function (networkType: string | undefined): string | undefined {
    if (!networkType) {
        return undefined;
    }
    const network = networks[networkType];
    return network && network.chainId;
};

export const getNetworkTypeByChainId = function (chainId: string | undefined): string | undefined {
    if (!chainId) {
        return;
    }
    return NETWORK_TITLES[chainId];
};

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
        chainId: '0x2a',
        type: 'kovan',
        title: 'Kovan',
        gasPrice: 2000000000,
        url: '',
        etherscanUrl: 'https://kovan.etherscan.io',
        isFork: false,
    },
    {
        chainId: '0x5',
        type: 'goerli',
        title: 'Goerli',
        gasPrice: 2000000000,
        url: '',
        etherscanUrl: 'https://goerli.etherscan.io',
        isFork: false,
    },
];

export const getDefaultNetworkConfigs = function (infuraProjectId: string, isDev?: boolean): NetworkConfig[] {
    const infuraNetworksWithProjectId = SUPPORTED_NETWORKS.map(network => ({
        ...network,
        url: `https://${n.type}.infura.io/v3/${infuraProjectId}`,
    }));
    if (!isDev) {
        return infuraNetworksWithProjectId;
    }
    return [
        ...infuraNetworksWithProjectId,
        {
            chainId: '0x539',
            type: 'localhost',
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
    '0x2a': 'kovan',
    '0x5': 'goerli',
};

export const getDecimalChainIdByNetworkType = function (networkType: string): number {
    const network = networks[networkType];
    if (!network || !network.chainId) {
        throw new Error(`No network with name "${networkType}" can be found`);
    }
    return parseInt(network.chainId, 16);
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

export const getNetworkConfigByType = function (networkType: string | undefined): NetworkConfig {
    if (!networkType || !networks[networkType]) {
        throw new Error(`No network found with name "${networkType}"`);
    }
    return networks[networkType];
};

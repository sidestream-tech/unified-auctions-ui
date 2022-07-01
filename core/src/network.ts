import type { NetworkConfig } from './types';

const networks: Record<string, NetworkConfig> = {};

export const getDefaultNetworkConfigs = function (infuraProjectId: string, isDev?: boolean): NetworkConfig[] {
    const infuraNetworks = [
        {
            chainId: '0x1',
            type: 'mainnet',
            title: 'Main',
            url: `https://mainnet.infura.io/v3/${infuraProjectId}`,
            etherscanUrl: 'https://etherscan.io',
            isFork: false,
        },
        {
            chainId: '0x2a',
            type: 'kovan',
            title: 'Kovan',
            gasPrice: 2000000000,
            url: `https://kovan.infura.io/v3/${infuraProjectId}`,
            etherscanUrl: 'https://kovan.etherscan.io',
            isFork: false,
        },
        {
            chainId: '0x5',
            type: 'goerli',
            title: 'Goerli',
            gasPrice: 2000000000,
            url: `https://goerli.infura.io/v3/${infuraProjectId}`,
            etherscanUrl: 'https://goerli.etherscan.io',
            isFork: false,
        },
    ];
    if (!isDev) {
        return infuraNetworks;
    }
    return [
        ...infuraNetworks,
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

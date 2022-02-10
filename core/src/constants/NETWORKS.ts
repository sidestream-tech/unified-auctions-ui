import type { NetworkConfig } from '../types';

export const CHAINLOG_ADDRESS = '0xdA0Ab1e0017DEbCd72Be8599041a2aa3bA7e740F';

const NETWORKS: Record<string, NetworkConfig> = {
    mainnet: {
        chainId: '0x1',
        title: 'Main',
        gasPrice: undefined,
        url: `https://mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
        etherscanUrl: 'https://etherscan.io',
        isFork: false,
    },
    kovan: {
        chainId: '0x2a',
        title: 'Kovan',
        gasPrice: 2000000000,
        url: `https://kovan.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
        etherscanUrl: 'https://kovan.etherscan.io',
        isFork: false,
    },
    goerli: {
        chainId: '0x5',
        title: 'Goerli',
        gasPrice: 2000000000,
        url: `https://goerli.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
        etherscanUrl: 'https://goerli.etherscan.io',
        isFork: false,
    },
    localhost: {
        chainId: '0x539',
        title: 'Localhost:8545',
        gasPrice: 2000000000000,
        url: `http://127.0.0.1:8545`,
        etherscanUrl: '',
        isFork: true,
    },
};

const NETWORK_TITLES: Record<string, string | undefined> = {
    // full list can be found on https://chainlist.org
    '0x1': 'mainnet',
    '0x2a': 'kovan',
    '0x3': 'ropsten',
    '0x4': 'rinkeby',
    '0x5': 'goerli',
};

export const getDecimalChainIdByNetworkType = function (networkType: string): number {
    const network = NETWORKS[networkType];
    if (!network || !network.chainId) {
        throw new Error(`No network with name "${networkType}" can be found`);
    }
    return parseInt(network.chainId, 16);
};

export const getChainIdByNetworkType = function (networkType: string | undefined): string | undefined {
    if (!networkType) {
        return undefined;
    }
    const network = NETWORKS[networkType];
    return network && network.chainId;
};

export const getNetworkTypeByChainId = function (chainId: string | undefined): string | undefined {
    const networkEntry = Object.entries(NETWORKS).find(([_, networkObject]) => networkObject.chainId === chainId);
    return networkEntry && networkEntry[0];
};

export const getNetworkConfigByType = function (networkType: string | undefined): NetworkConfig {
    if (!networkType || !NETWORKS[networkType]) {
        throw new Error(`No network found with name "${networkType}"`);
    }
    return NETWORKS[networkType];
};

export const getNetworkTitleByChainId = function (chainId: string | undefined) {
    if (!chainId) {
        return;
    }
    return NETWORK_TITLES[chainId];
};

export default NETWORKS;

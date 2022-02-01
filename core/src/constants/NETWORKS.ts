import type { NetworkConfig } from '../types';

export const CHAINLOG_ADDRESS = '0xdA0Ab1e0017DEbCd72Be8599041a2aa3bA7e740F';

const NETWORKS: Record<string, NetworkConfig> = {
    mainnet: {
        chainId: '0x1',
        title: 'Main',
        gasPrice: undefined,
        url: `https://mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
        etherscanUrl: 'https://etherscan.io',
        uniswapV2CalleeDaiAddress: '0x49399BB0Fcb52b32aB5A0909206BFf7B54FF80b3',
        uniswapV2LpTokenCalleeDaiAddress: '0x74893C37beACf205507ea794470b13DE06294220',
    },
    kovan: {
        chainId: '0x2a',
        title: 'Kovan',
        gasPrice: 2000000000,
        url: `/json-rpc/kovan`,
        etherscanUrl: 'https://kovan.etherscan.io',
        uniswapV2CalleeDaiAddress: '0x5A40F810754f725DA93e2362775a0600468f7a83',
        uniswapV2LpTokenCalleeDaiAddress: '0xDeC8b9c2829583A89f7F182DEeD7C12112dfAeD0',
    },
    goerli: {
        chainId: '0x5',
        title: 'Goerli',
        gasPrice: 2000000000,
        url: `https://goerli.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
        etherscanUrl: 'https://goerli.etherscan.io',
        uniswapV2CalleeDaiAddress: '0x6d9139ac89ad2263f138633de20e47bcae253938',
        uniswapV2LpTokenCalleeDaiAddress: '0x13eba3f2dd908e3624e9fb721ea9bd2f5d46f2c0',
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

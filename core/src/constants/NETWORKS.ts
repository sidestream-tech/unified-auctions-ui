export const CHAINLOG_ADDRESS = '0xdA0Ab1e0017DEbCd72Be8599041a2aa3bA7e740F';

const NETWORKS: Record<string, { title: string; etherscanURL: string; gasPrice?: number }> = {
    // full list can be found on https://chainlist.org
    '0x1': {
        title: 'mainnet',
        etherscanURL: 'https://etherscan.io',
    },
    '0x2a': {
        title: 'kovan',
        etherscanURL: 'https://kovan.etherscan.io',
        gasPrice: 2000000000,
    },
    '0x3': {
        title: 'ropsten',
        etherscanURL: 'https://ropsten.etherscan.io',
    },
    '0x4': {
        title: 'rinkeby',
        etherscanURL: 'https://rinkeby.etherscan.io',
    },
    '0x5': {
        title: 'goerli',
        etherscanURL: 'https://goerli.etherscan.io',
        gasPrice: 2000000000,
    },
    '0x539': {
        title: 'localhost',
        etherscanURL: '',
    },
};

export const INFURA_NETWORK_RPCS: { network: string; url: string }[] = [
    {
        network: 'mainnet',
        url: 'https://mainnet.infura.io/v3',
    },
    {
        network: 'kovan',
        url: 'https://kovan.infura.io/v3',
    },
    {
        network: 'goerli',
        url: 'https://goerli.infura.io/v3',
    },
];

export const getNetworkInfoByChainId = function (chainId: string | undefined) {
    if (!chainId) {
        return;
    }
    return NETWORKS[chainId];
};

export const getNetworkTitleByChainId = function (chainId: string | undefined) {
    if (!chainId) {
        return;
    }
    return NETWORKS[chainId].title;
};

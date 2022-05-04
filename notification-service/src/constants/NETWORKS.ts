export const NETWORKS: Record<string, { network: string; etherscanURL: string }> = {
    mainnet: {
        network: 'mainnet',
        etherscanURL: 'https://etherscan.io',
    },
    ropsten: {
        network: 'ropsten',
        etherscanURL: 'https://ropsten.etherscan.io',
    },
    kovan: {
        network: 'kovan',
        etherscanURL: 'https://kovan.etherscan.io',
    },
    rinkeby: {
        network: 'rinkeby',
        etherscanURL: 'https://rinkeby.etherscan.io',
    },
    goerli: {
        network: 'goerli',
        etherscanURL: 'https://goerli.etherscan.io',
    },
};

export function isNetworkSupported(network: string) {
    if (!NETWORKS[network]) {
        throw new Error(`No network found with name "${network}"`);
    }
}

export function getEtherscanURL(network: string) {
    return NETWORKS[network].etherscanURL;
}

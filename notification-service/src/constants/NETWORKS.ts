export const NETWORKS: Record<string, { network: string; etherscanURL: string; etherscanAPI: string }> = {
    mainnet: {
        network: 'mainnet',
        etherscanURL: 'https://etherscan.io',
        etherscanAPI: 'https://api.etherscan.io',
    },
    ropsten: {
        network: 'ropsten',
        etherscanURL: 'https://ropsten.etherscan.io',
        etherscanAPI: 'https://api-ropsten.etherscan.io',
    },
    rinkeby: {
        network: 'rinkeby',
        etherscanURL: 'https://rinkeby.etherscan.io',
        etherscanAPI: 'https://api-rinkeby.etherscan.io',
    },
    goerli: {
        network: 'goerli',
        etherscanURL: 'https://goerli.etherscan.io',
        etherscanAPI: 'https://api-goerli.etherscan.io',
    },
};

export function isNetworkSupported(network: string) {
    if (!NETWORKS[network]) {
        throw new Error(`No network found with name "${network}"`);
    }
}

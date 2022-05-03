export const NETWORKS = [
    'mainnet',
    'ropsten',
    'kovan',
    'rinkeby',
    'goerli',
    'palm-mainnet',
    'palm-testnet',
    'aurora-mainnet',
    'aurora-testnet',
    'near-mainnet',
    'near-testnet',
];

export function isNetworkSupported(network: string) {
    if (!NETWORKS.includes(network)) {
        throw new Error(`No network found with name "${network}"`);
    }
}

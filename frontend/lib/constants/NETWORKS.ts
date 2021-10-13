const NETWORKS: Record<string, NetworkConfig> = {
    mainnet: {
        chainId: '0x1',
        title: 'Main',
        url: `https://mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
        etherscanUrl: 'https://etherscan.io',
    },
    kovan: {
        chainId: '0x2a',
        title: 'Kovan',
        url: `https://kovan.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
        etherscanUrl: 'https://kovan.etherscan.io',
    },
};

export const getChainIdByNetworkType = function (networkType: string | null): string | undefined {
    if (!networkType) {
        return undefined;
    }
    const network = NETWORKS[networkType];
    return network && network.chainId;
};

export const getNetworkTypeByChainId = function (chainId: string | null): string | undefined {
    const networkEntry = Object.entries(NETWORKS).find(([_, networkObject]) => networkObject.chainId === chainId);
    return networkEntry && networkEntry[0];
};

export default NETWORKS;

const NETWORKS: Record<string, NetworkConfig> = {
    mainnet: {
        chainId: '0x1',
        title: 'Main',
        url: `https://mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
        etherscanUrl: 'https://etherscan.io',
        uniswapV2CalleeDaiAddress: '0x49399BB0Fcb52b32aB5A0909206BFf7B54FF80b3',
        uniswapV2LpTokenCalleeDaiAddress: '0x74893C37beACf205507ea794470b13DE06294220',
    },
    kovan: {
        chainId: '0x2a',
        title: 'Kovan',
        url: `https://kovan.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
        etherscanUrl: 'https://kovan.etherscan.io',
        uniswapV2CalleeDaiAddress: '0x5A40F810754f725DA93e2362775a0600468f7a83',
        uniswapV2LpTokenCalleeDaiAddress: '0xDeC8b9c2829583A89f7F182DEeD7C12112dfAeD0',
    },
};

export const getDecimalChainIdByNetworkType = function (networkType: string): number {
    const network = NETWORKS[networkType];
    if (!network || !network.chainId) {
        throw new Error(`No network with name "${networkType}" can be found`);
    }
    return parseInt(network.chainId, 16);
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

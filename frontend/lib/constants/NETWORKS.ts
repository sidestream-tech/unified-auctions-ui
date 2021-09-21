const NETWORKS: Record<string, NetworkConfig> = {
    mainnet: {
        title: 'Main',
        url: `https://mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
        etherscanUrl: 'https://etherscan.io',
    },
    kovan: {
        title: 'Kovan',
        url: `https://kovan.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
        etherscanUrl: 'https://kovan.etherscan.io',
    },
};

export default NETWORKS;

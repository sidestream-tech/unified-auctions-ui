const NETWORKS: Record<string, NetworkConfig> = {
    mainnet: {
        title: 'Main',
        url: `https://mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
    },
    kovan: {
        title: 'Kovan',
        url: `https://kovan.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
    },
};

export default NETWORKS;

import dotenv from 'dotenv';
import '@nomiclabs/hardhat-waffle';

dotenv.config();

const LOCAL_RPC_URL = process.env.LOCAL_RPC_URL || 'http://localhost:8545';

const customNetworkConfig = {
    testnetwork: {
        url: LOCAL_RPC_URL,
    },
};

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
export default {
    solidity: '0.8.4',
    networks: customNetworkConfig,
};

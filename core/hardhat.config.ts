import dotenv from 'dotenv';
import '@nomiclabs/hardhat-waffle';

dotenv.config();

const NETWORK_HOST = process.env.NETWORK_HOST || 'localhost';
const NETWORK_PORT = process.env.NETWORK_PORT || '8545';
const LOCAL_NETWORK_URL = `http://${NETWORK_HOST}:${NETWORK_PORT}`;

const customNetworkConfig = {
    [NETWORK_HOST]: {
        url: LOCAL_NETWORK_URL,
    },
};

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
export default {
    solidity: '0.8.4',
    networks: customNetworkConfig,
};

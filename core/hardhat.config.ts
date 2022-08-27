import dotenv from 'dotenv';
import '@nomiclabs/hardhat-waffle';
import ethers from '@nomiclabs/hardhat-ethers';

dotenv.config();

const LOCAL_RPC_URL = process.env.LOCAL_RPC_URL || 'http://localhost:8545';
const REMOTE_RPC_URL = process.env.REMOTE_RPC_URL;

if (!REMOTE_RPC_URL) {
    throw new Error('REMOTE_RPC_URL env variable not set, please check your `hardhat/.env` file');
}

const customNetworkConfig = {
    testnetwork: {
        url: LOCAL_RPC_URL,
    },
    hardhat: {
        chainId: 1337,
        forking: {
            url: REMOTE_RPC_URL,
            // Few blocks before WSTETH-A is taken at 14052147,
            // https://etherscan.io/address/0x49a33a28c4c7d9576ab28898f4c9ac7e52ea457a
            blockNumber: 14052140,
        },
        initialBaseFeePerGas: 1,
    },
};

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
export default {
    solidity: '0.8.4',
    networks: customNetworkConfig,
    ethers: ethers,
};

import dotenv from 'dotenv';
import '@nomiclabs/hardhat-waffle';
import ethers from '@nomiclabs/hardhat-ethers';

dotenv.config();

const REMOTE_RPC_URL = process.env.REMOTE_RPC_URL;

if (!REMOTE_RPC_URL) {
    throw new Error('REMOTE_RPC_URL env variable not set, please check your `hardhat/.env` file');
}

const customNetworkConfig = {
    hardhat: {
        chainId: 1337,
        forking: {
            url: REMOTE_RPC_URL,
        },
        initialBaseFeePerGas: 1,
        allowUnlimitedContractSize: true,
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

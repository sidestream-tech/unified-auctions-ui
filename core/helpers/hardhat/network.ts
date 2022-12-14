import hre from 'hardhat';
import { EthereumProvider } from 'hardhat/types';
import { formatToHexWithoutPad } from '../format';
import { setupRpcUrlAndGetNetworks } from '../../src/rpc';
import { createWalletFromPrivateKey } from '../../src/signer';
import { HARDHAT_PRIVATE_KEY, LOCAL_RPC_URL, TEST_NETWORK, REMOTE_RPC_URL } from '../../helpers/constants';
import getProvider from '../../src/provider';

export const resetNetwork = async (
    blockNumber: number | undefined = undefined,
    rpcUrl: string | undefined = REMOTE_RPC_URL,
    provider: EthereumProvider = hre.network.provider
) => {
    if (!rpcUrl && !REMOTE_RPC_URL) {
        throw Error('Environment varialbe REMOTE_RPC_URL was not provided');
    }
    if (blockNumber) {
        console.info(`Forking at the block "${blockNumber}"`);
    } else {
        console.info('Forking at the latest block');
    }
    await provider.request({
        method: 'hardhat_reset',
        params: [
            {
                forking: {
                    jsonRpcUrl: rpcUrl,
                    blockNumber: blockNumber,
                },
                allowUnlimitedContractSize: true,
            },
        ],
    });
};

export const createWalletForRpc = async (walletPrivateKey: string = HARDHAT_PRIVATE_KEY) => {
    await setupRpcUrlAndGetNetworks(LOCAL_RPC_URL);
    console.info(`New RPC endpoint has started on ${LOCAL_RPC_URL}`);
    const walletAddress = await createWalletFromPrivateKey(walletPrivateKey, TEST_NETWORK);
    console.info(`Using wallet with:\n\t - public key: ${walletAddress}\n\t - private key: ${walletPrivateKey}`);
    return hre.network.provider;
};

export const warpTime = async function (blocks = 20000, secondsBetweenBlocks = 270) {
    const provider = await getProvider(TEST_NETWORK);
    await provider.send('hardhat_mine', [formatToHexWithoutPad(blocks), formatToHexWithoutPad(secondsBetweenBlocks)]);
    return blocks * secondsBetweenBlocks;
};

export const resetNetworkAndSetupWallet = async function (
    blockNumber?: number,
    walletPrivateKey: string = HARDHAT_PRIVATE_KEY
) {
    await resetNetwork(blockNumber);
    const provider = await createWalletForRpc(walletPrivateKey);
    return provider;
};

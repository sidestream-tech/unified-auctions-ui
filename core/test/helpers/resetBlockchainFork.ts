import hre from 'hardhat';
import { setupRpcUrlAndGetNetworks } from '../../src/rpc';
import { createWalletFromPrivateKey } from '../../src/signer';
import { NETWORK, REMOTE_RPC_URL } from '../../helpers/constants';

export const resetNetwork = async (blockNumber: number, rpcUrl: string = REMOTE_RPC_URL) => {
    await hre.network.provider.request({
        method: 'hardhat_reset',
        params: [
            {
                forking: {
                    jsonRpcUrl: rpcUrl,
                    blockNumber: blockNumber,
                },
            },
        ],
    });
};

export const createWalletForRpc = async (signerPrivateKey: string, network: string = NETWORK) => {
    const local_rpc_url = process.env.LOCAL_RPC_URL || 'http://localhost:8545';
    await setupRpcUrlAndGetNetworks(local_rpc_url);
    await createWalletFromPrivateKey(signerPrivateKey, network);
    return hre.network.provider;
};

export default async function (
    blockNumber: number,
    signerPrivateKey: string,
    network: string = NETWORK,
    rpcUrl: string = REMOTE_RPC_URL
) {
    await resetNetwork(blockNumber, rpcUrl);
    const provider = await createWalletForRpc(signerPrivateKey, network);
    return provider;
}

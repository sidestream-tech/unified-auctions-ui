import hre from 'hardhat';
import { setupRpcUrlAndGetNetworks } from '../../src/rpc';
import { createWalletFromPrivateKey } from '../../src/signer';

export const resetNetwork = async (rpcUrl: string, blockNumber: number) => {
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

export const createWalletForRpc = async (signerPrivateKey: string, network: string) => {
    const local_rpc_url = process.env.LOCAL_RPC_URL || 'http://localhost:8545';
    await setupRpcUrlAndGetNetworks(local_rpc_url);
    await createWalletFromPrivateKey(signerPrivateKey, network);
    return hre.network.provider;
};

export default async function (rpcUrl: string, blockNumber: number, signerPrivateKey: string, network: string) {
    await resetNetwork(rpcUrl, blockNumber);
    const provider = await createWalletForRpc(signerPrivateKey, network);
    return provider;
}

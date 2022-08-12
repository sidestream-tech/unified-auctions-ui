import { setupRpcUrlAndGetNetworks } from '../src/rpc';
import { createWalletFromPrivateKey } from '../src/signer';
import hre from 'hardhat';
import { causeDebt } from '../helpers/causeDebt';
import BigNumber from '../src/bignumber';

const provider = hre.network.provider;
const HARDHAT_PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'; // deterministic private key from hardhat.

(async () => {
    const local_rpc_url = process.env.LOCAL_RPC_URL || 'http://localhost:8545';
    await setupRpcUrlAndGetNetworks(local_rpc_url);
    await createWalletFromPrivateKey(HARDHAT_PRIVATE_KEY, 'custom');
    await causeDebt('custom', provider, new BigNumber(10), new BigNumber(1000), new BigNumber(1000));
})();

import { setupRpcUrlAndGetNetworks } from '../src/rpc';
import { createWalletFromPrivateKey } from '../src/signer';
import hre from 'hardhat';
import { causeDebt } from '../helpers/causeDebt';
import BigNumber from '../src/bignumber';
import { HARDHAT_PRIVATE_KEY } from '../helpers/constants';

const provider = hre.network.provider;

(async () => {
    const local_rpc_url = process.env.LOCAL_RPC_URL || 'http://localhost:8545';
    await setupRpcUrlAndGetNetworks(local_rpc_url);
    await createWalletFromPrivateKey(HARDHAT_PRIVATE_KEY, 'custom');
    await causeDebt('custom', provider, new BigNumber(10), new BigNumber(1000), new BigNumber(1000));
})();

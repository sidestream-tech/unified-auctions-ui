import { expect } from 'chai';
import { setupRpcUrlAndGetNetworks } from '../src/rpc';
import { causeDebt } from './helpers/causeDebt';
import hre from 'hardhat';
import { createWalletFromPrivateKey } from '../src/signer';
import getContract from '../src/contracts';

const HARDHAT_PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'; // deterministic private key from hardhat.
const NETWORK = 'custom';

describe('Debt Auction', () => {
    before(async () => {
        const local_rpc_url = process.env.LOCAL_RPC_URL || 'http://localhost:8545';
        await setupRpcUrlAndGetNetworks(local_rpc_url);
        await createWalletFromPrivateKey(HARDHAT_PRIVATE_KEY, NETWORK);
        const provider = hre.network.provider;

        await causeDebt(NETWORK, provider);
    });
    it('Flopper kicked', async () => {
        const debtContract = await getContract(NETWORK, 'MCD_FLOP');
        const kicks = await debtContract.kicks();
        expect(kicks._hex).to.eq('0x01');
    });
});

import { expect } from 'chai';
import { setupRpcUrlAndGetNetworks } from '../src/rpc';
import { causeDebt } from '../helpers/causeDebt';
import hre from 'hardhat';
import { createWalletFromPrivateKey } from '../src/signer';
import getContract from '../src/contracts';
import BigNumber from '../src/bignumber';

const REMOTE_RPC_URL = process.env.REMOTE_RPC_URL;
const HARDHAT_PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'; // deterministic private key from hardhat.
const NETWORK = 'custom';
const HARDHAT_FORK_BLOCK_NUMBER = 14078340;

describe('Debt Auction', () => {
    before(async () => {
        const local_rpc_url = process.env.LOCAL_RPC_URL || 'http://localhost:8545';
        await setupRpcUrlAndGetNetworks(local_rpc_url);
        await createWalletFromPrivateKey(HARDHAT_PRIVATE_KEY, NETWORK);
        const provider = hre.network.provider;

        await causeDebt(NETWORK, provider, new BigNumber(1000000));
    });
    beforeEach(async () => {
        await hre.network.provider.request({
            method: 'hardhat_reset',
            params: [
                {
                    forking: {
                        jsonRpcUrl: REMOTE_RPC_URL,
                        blockNumber: HARDHAT_FORK_BLOCK_NUMBER,
                    },
                },
            ],
        });
    });
    it('Flopper kicked', async () => {
        const debtContract = await getContract(NETWORK, 'MCD_FLOP');
        const kicks = await debtContract.kicks();
        expect(kicks._hex).to.eq('0x01');
    });
});

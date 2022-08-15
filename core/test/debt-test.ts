import { expect } from 'chai';
import { causeDebt } from '../helpers/causeDebt';
import getContract from '../src/contracts';
import BigNumber from '../src/bignumber';
import reset from './helpers/resetBlockchainFork';

const REMOTE_RPC_URL = process.env.REMOTE_RPC_URL || 'http://localhost:8545';
const HARDHAT_PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'; // deterministic private key from hardhat.
const NETWORK = 'custom';
const HARDHAT_FORK_BLOCK_NUMBER = 14052140;

describe('Debt Auction', () => {
    beforeEach(async () => {
        const provider = await reset(REMOTE_RPC_URL, HARDHAT_FORK_BLOCK_NUMBER, HARDHAT_PRIVATE_KEY, NETWORK)
        await causeDebt(NETWORK, provider, new BigNumber(10), new BigNumber(1000), new BigNumber(1000));
    });
    it('Flopper kicked', async () => {
        const debtContract = await getContract(NETWORK, 'MCD_FLOP');
        const kicks = await debtContract.kicks();
        expect(kicks._hex).to.eq('0x01');
    });
});

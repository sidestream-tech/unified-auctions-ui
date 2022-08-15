import { expect } from 'chai';
import { causeDebt } from '../helpers/causeDebt';
import getContract from '../src/contracts';
import BigNumber from '../src/bignumber';
import reset from './helpers/resetBlockchainFork';
import { HARDHAT_PRIVATE_KEY, HARDHAT_FORK_BLOCK_NUMBER, NETWORK } from '../helpers/constants';

const REMOTE_RPC_URL = process.env.REMOTE_RPC_URL || 'http://localhost:8545';

describe('Debt Auction', () => {
    beforeEach(async () => {
        const provider = await reset(REMOTE_RPC_URL, HARDHAT_FORK_BLOCK_NUMBER, HARDHAT_PRIVATE_KEY, NETWORK);
        await causeDebt(NETWORK, provider, new BigNumber(10), new BigNumber(1000), new BigNumber(1000));
    });
    it('Flopper kicked', async () => {
        const debtContract = await getContract(NETWORK, 'MCD_FLOP');
        const kicks = await debtContract.kicks();
        expect(kicks._hex).to.eq('0x01');
    });
});

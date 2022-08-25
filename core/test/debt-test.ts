import { expect } from 'chai';
import { causeDebt } from '../helpers/causeDebt';
import getContract from '../src/contracts';
import { HARDHAT_PRIVATE_KEY, NETWORK, REMOTE_RPC_URL } from '../helpers/constants';
import { resetBlockchainFork as reset } from '../helpers/hardhat';
const HARDHAT_FORK_BLOCK_NUMBER = 14052140;

describe('Debt Auction', () => {
    beforeEach(async () => {
        const provider = await reset(HARDHAT_FORK_BLOCK_NUMBER, HARDHAT_PRIVATE_KEY, NETWORK, REMOTE_RPC_URL);
        await causeDebt(NETWORK, provider);
    });
    it('Flopper kicked', async () => {
        const debtContract = await getContract(NETWORK, 'MCD_FLOP');
        const kicks = await debtContract.kicks();
        expect(kicks._hex).to.eq('0x01');
    });
});

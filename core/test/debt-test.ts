import { expect } from 'chai';
import { causeDebt } from '../helpers/auctionSimulators';
import getContract from '../src/contracts';
import { TEST_NETWORK } from '../helpers/constants';
import { resetNetworkAndSetupWallet as reset } from '../helpers/hardhat/network';

describe('Debt Auction', () => {
    beforeEach(async () => {
        // Reset at the block where with the previous MCD_FLOP contract version
        await reset(14052140);
        await causeDebt();
    });
    it('Flopper kicked', async () => {
        const debtContract = await getContract(TEST_NETWORK, 'MCD_FLOP');
        const kicks = await debtContract.kicks();
        expect(kicks._hex).to.eq('0x01');
    });
});

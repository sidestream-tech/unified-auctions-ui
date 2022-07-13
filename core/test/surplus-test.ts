import { expect } from 'chai';
import {
    fetchActiveSurplusAuctions,
    bidToSurplusAuction,
    collectSurplusAuction,
    fetchSurplusAuctionByIndex,
    restartSurplusAuction,
    getNextMinimumBet,
} from '../src/surplus';
import { setAllowanceAmountMKR } from '../src/authorizations';
import { setupRpcUrlAndGetNetworks } from '../src/rpc';
import { swapToMKR } from '../src/helpers/swap';
import { createWalletFromPrivateKey } from '../src/signer';

import { SurplusAuction } from '../src/types';
import hre from 'hardhat';

const REMOTE_RPC_URL = process.env.REMOTE_RPC_URL;
const HARDHAT_PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'; // deterministic private key from hardhat.
const HARDHAT_FORK_BLOCK_NUMBER = 14078339;

describe('Surplus Auction', () => {
    before(async () => {
        const local_rpc_url = process.env.LOCAL_RPC_URL || 'http://localhost:8545';
        await setupRpcUrlAndGetNetworks(local_rpc_url);
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
    it('fetches active auctions', async () => {
        const auctions = await fetchActiveSurplusAuctions('custom');
        expect(auctions.length).to.equal(5);
        expect(auctions[0].id).to.equal(2328);
        expect(auctions[0].state).to.equal('have-bids');
    });
    it('participates in active auction', async () => {
        const address = await createWalletFromPrivateKey(HARDHAT_PRIVATE_KEY, 'custom');
        await setAllowanceAmountMKR('custom', address, '20');
        await swapToMKR('custom', 20, 20);
        await bidToSurplusAuction('custom', 2328, '20');
        const auctions = await fetchActiveSurplusAuctions('custom');
        const currentAuction = auctions[0] as SurplusAuction;
        expect(currentAuction.id).to.equal(2328);
        expect(currentAuction.bidAmountMKR && currentAuction.bidAmountMKR.eq(20)).to.be.true;
    });
    it('collects the concluded auction', async () => {
        const auctionsBeforeCollection = await fetchActiveSurplusAuctions('custom');
        expect(auctionsBeforeCollection.length).to.equal(5);
        expect(auctionsBeforeCollection[1].id).to.equal(2327);
        expect(auctionsBeforeCollection[1].state).to.equal('ready-for-collection');

        await collectSurplusAuction('custom', auctionsBeforeCollection[1].id);

        const auctionAfterCollection = await fetchSurplusAuctionByIndex('custom', 2327);
        expect(auctionAfterCollection.id).to.equal(2327);
        expect(auctionAfterCollection.state).to.equal('collected');
    });
    it('restarts the auction', async () => {
        await hre.network.provider.request({
            method: 'hardhat_reset',
            params: [
                {
                    forking: {
                        jsonRpcUrl: REMOTE_RPC_URL,
                        blockNumber: HARDHAT_FORK_BLOCK_NUMBER - 1,
                    },
                },
            ],
        });
        const blocks = 20000;
        const secondsBetweenBlocks = 270;
        await hre.network.provider.send('hardhat_mine', [
            `0x${blocks.toString(16)}`,
            `0x${secondsBetweenBlocks.toString(16)}`,
        ]);
        await restartSurplusAuction('custom', 2328);
    });
    it('forbids restarting active auctions', async () => {
        expect(restartSurplusAuction('custom', 2328)).to.be.reverted;
    });
    it('forbids collecting inexistant auctions', async () => {
        expect(collectSurplusAuction('custom', 3333)).to.be.revertedWith('Did not find the auction to collect.');
    });
    it('forbids bidding on inexistant auctions', async () => {
        expect(bidToSurplusAuction('custom', 3333, '20')).to.be.revertedWith('Did not find the auction to bid on.');
    });
    it('forbids fetching inexistant auctions', async () => {
        expect(fetchSurplusAuctionByIndex('custom', 3333)).to.be.revertedWith('No active auction exists with this id');
    });
    it('calculates the minimum bet increase', async () => {
        const auctions = await fetchActiveSurplusAuctions('custom');
        expect(auctions[0].id).to.equal(2328);

        const bet = await getNextMinimumBet('custom', auctions[0]);
        expect(bet!.toString()).to.equal('16.94241213279722952');
        expect(auctions[0].bidAmountMKR!.toString()).to.equal('16.290780896920413');
    });
});

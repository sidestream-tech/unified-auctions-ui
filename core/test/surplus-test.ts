import { expect } from 'chai';
import hre from 'hardhat';
import {
    fetchActiveSurplusAuctions,
    bidToSurplusAuction,
    collectSurplusAuction,
    fetchSurplusAuctionByIndex,
    restartSurplusAuction,
    getNextMinimumBid,
    enrichSurplusAuction,
} from '../src/surplus';
import { setAllowanceAmountMKR } from '../src/authorizations';
import { setupRpcUrlAndGetNetworks } from '../src/rpc';
import { swapToMKR } from '../src/helpers/swap';
import { createWalletFromPrivateKey } from '../src/signer';
import { SurplusAuctionActive } from '../src/types';
import executeTransaction from '../src/execute';
import * as forkDate from '../src/date';
import clearChache from './helpers/cache';
import * as sinon from 'sinon';

import BigNumber from '../src/bignumber';

const REMOTE_RPC_URL = process.env.REMOTE_RPC_URL;
const HARDHAT_PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'; // deterministic private key from hardhat.
const HARDHAT_FORK_BLOCK_NUMBER = 14078339;

export const fetchForkDate = async function (): Promise<Date> {
    const block = await hre.ethers.provider.getBlock('latest');
    return new Date(block.timestamp * 1000);
};

describe('Surplus Auction', () => {
    let stubbed: sinon.SinonStub<any>;
    before(async () => {
        const local_rpc_url = process.env.LOCAL_RPC_URL || 'http://localhost:8545';
        await setupRpcUrlAndGetNetworks(local_rpc_url);
        clearChache([executeTransaction]);
        stubbed = sinon.stub(forkDate, 'fetchDateByBlockNumber').returns(fetchForkDate());
    });
    after(() => {
        stubbed.restore();
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
        clearChache([forkDate.fetchLatestBlockDateAndCacheDate]);
        const auctions = await fetchActiveSurplusAuctions('custom');
        expect(auctions.length).to.equal(5);
        expect(auctions[0].id).to.equal(2328);
        expect(auctions[0].state).to.equal('have-bids');
    });
    it('enriches auctions with market prices', async () => {
        const network = 'custom';
        const auctions = await fetchActiveSurplusAuctions(network);
        const auction = auctions[0] as SurplusAuctionActive;
        const enrichedAucton = await enrichSurplusAuction(network, auction);
        expect(enrichedAucton.marketUnitPrice?.toString()).to.equal('0.001395892836151232667549186');
        expect(enrichedAucton.unitPrice?.toString()).to.equal('0.0005430260298973471');
        expect(enrichedAucton.marketUnitPriceToUnitPriceRatio?.toString()).to.equal('-0.61098300970253348099040009');
    });
    it('enrichesAuctionWithMiniumumBids', async () => {
        const network = 'custom';
        const auctions = await fetchActiveSurplusAuctions(network);
        const auction = auctions[0] as SurplusAuctionActive;
        const enrichedAuction = await enrichSurplusAuction(network, auction);

        if (!enrichedAuction.nextMinimumBid || !enrichedAuction.bidAmountMKR) {
            throw new Error('Expected values were not defined.');
        }
        expect(enrichedAuction.nextMinimumBid.toString()).to.be.equal('16.94241213279722952');
        expect(enrichedAuction.nextMinimumBid.div(enrichedAuction.bidAmountMKR).toString()).to.be.equal('1.04');
    });
    it('participates in active auction', async () => {
        const address = await createWalletFromPrivateKey(HARDHAT_PRIVATE_KEY, 'custom');
        await setAllowanceAmountMKR('custom', address, new BigNumber('20'));
        await swapToMKR('custom', 20, 20);
        await bidToSurplusAuction('custom', 2328, new BigNumber('20'));
        const auctions = await fetchActiveSurplusAuctions('custom');
        const currentAuction = auctions[0];
        expect(currentAuction.id).to.equal(2328);
        if (currentAuction.state === 'collected') {
            throw new Error('auction state can not be "collected"');
        }
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
        expect(bidToSurplusAuction('custom', 3333, new BigNumber('20'))).to.be.revertedWith(
            'Did not find the auction to bid on.'
        );
    });
    it('forbids fetching inexistant auctions', async () => {
        expect(fetchSurplusAuctionByIndex('custom', 3333)).to.be.revertedWith('No active auction exists with this id');
    });
    it('calculates the minimum bid increase', async () => {
        const auctions = await fetchActiveSurplusAuctions('custom');
        expect(auctions[0].id).to.equal(2328);
        const auction = auctions[0] as SurplusAuctionActive;

        const bid = await getNextMinimumBid('custom', auction);
        expect(bid.toString()).to.equal('16.94241213279722952');
        expect(auction.bidAmountMKR.toString()).to.equal('16.290780896920413');
        const address = await createWalletFromPrivateKey(HARDHAT_PRIVATE_KEY, 'custom');
        await setAllowanceAmountMKR('custom', address, new BigNumber('20'));
        await swapToMKR('custom', 20, 20);
        await bidToSurplusAuction('custom', 2328, bid);
    });
});

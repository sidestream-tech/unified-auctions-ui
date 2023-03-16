import { expect } from 'chai';
import hre from 'hardhat';
import {
    bidToSurplusAuction,
    collectSurplusAuction,
    enrichSurplusAuction,
    fetchActiveSurplusAuctions,
    getNextMinimumBid,
    restartSurplusAuction,
} from '../src/surplus';
import { setAllowanceAmountMKR } from '../src/authorizations';
import { setupRpcUrlAndGetNetworks } from '../src/rpc';
import { swapToMKR } from '../src/helpers/swap';
import { createWalletFromPrivateKey } from '../src/signer';
import { SurplusAuctionActive } from '../src/types';
import { resetNetwork } from '../helpers/hardhat/network';

import BigNumber from '../src/bignumber';
import { fetchSurplusAuctionByIndex } from '../src/surplus';
import { HARDHAT_PRIVATE_KEY, LOCAL_RPC_URL, TEST_NETWORK, REMOTE_RPC_URL } from '../helpers/constants';
import { formatToHexWithoutPad } from '../helpers/format';

const HARDHAT_FORK_BLOCK_NUMBER = 14078339;

if (!REMOTE_RPC_URL) {
    throw new Error('REMOTE_RPC_URL environment varialbe is not set.');
}

describe('Surplus Auction', () => {
    before(async () => {
        await setupRpcUrlAndGetNetworks(LOCAL_RPC_URL);
    });
    beforeEach(async () => {
        resetNetwork(HARDHAT_FORK_BLOCK_NUMBER);
    });
    it('fetches active auctions', async () => {
        const auctions = await fetchActiveSurplusAuctions(TEST_NETWORK);
        expect(auctions.length).to.equal(5);
        const auction = auctions[0] as SurplusAuctionActive;
        expect(auction.id).to.equal(2328);
        expect(auction.state).to.equal('have-bids');
        expect(auction.auctionStartDate.toISOString()).to.equal('2022-01-26T01:31:58.000Z');
        expect(auction.auctionStartDate.getTime()).to.be.lessThan(auction.auctionEndDate.getTime());
    });
    it('enriches auctions with market prices', async () => {
        const network = TEST_NETWORK;
        const auctions = await fetchActiveSurplusAuctions(network);
        const auction = auctions[0] as SurplusAuctionActive;
        const enrichedAucton = await enrichSurplusAuction(network, auction);
        expect(enrichedAucton.marketUnitPrice?.toString()).to.equal('0.001395892836151232667549185678491851066262951');
        expect(enrichedAucton.unitPrice?.toString()).to.equal('0.0005430260298973471');
        expect(enrichedAucton.marketUnitPriceToUnitPriceRatio?.toString()).to.equal(
            '-0.610983009702533480990400000000000000000000026'
        );
    });
    it('enrichesAuctionWithMinimumBids', async () => {
        const network = TEST_NETWORK;
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
        const address = await createWalletFromPrivateKey(HARDHAT_PRIVATE_KEY, TEST_NETWORK);
        await setAllowanceAmountMKR(TEST_NETWORK, address, new BigNumber('20'));
        await swapToMKR(TEST_NETWORK, 20, 20);
        await bidToSurplusAuction(TEST_NETWORK, 2328, new BigNumber('20'));
        const auctions = await fetchActiveSurplusAuctions(TEST_NETWORK);
        const currentAuction = auctions[0];
        expect(currentAuction.id).to.equal(2328);
        expect(currentAuction.bidAmountMKR && currentAuction.bidAmountMKR.eq(20)).to.be.true;
    });
    it('collects the concluded auction', async () => {
        const auctionsBeforeCollection = await fetchActiveSurplusAuctions(TEST_NETWORK);
        expect(auctionsBeforeCollection.length).to.equal(5);
        expect(auctionsBeforeCollection[1].id).to.equal(2327);
        expect(auctionsBeforeCollection[1].state).to.equal('ready-for-collection');

        await collectSurplusAuction(TEST_NETWORK, auctionsBeforeCollection[1].id);

        const auctionAfterCollection = await fetchSurplusAuctionByIndex(TEST_NETWORK, 2327);
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
            formatToHexWithoutPad(blocks),
            formatToHexWithoutPad(secondsBetweenBlocks),
        ]);
        await restartSurplusAuction(TEST_NETWORK, 2328);
    });
    it('forbids restarting active auctions', async () => {
        expect(restartSurplusAuction(TEST_NETWORK, 2328)).to.be.reverted;
    });
    it('forbids collecting inexistent auctions', async () => {
        expect(collectSurplusAuction(TEST_NETWORK, 3333)).to.be.revertedWith('Did not find the auction to collect.');
    });
    it('forbids bidding on inexistent auctions', async () => {
        expect(bidToSurplusAuction(TEST_NETWORK, 3333, new BigNumber('20'))).to.be.revertedWith(
            'Did not find the auction to bid on.'
        );
    });
    it('forbids fetching inexistent auctions', async () => {
        expect(fetchSurplusAuctionByIndex(TEST_NETWORK, 3333)).to.be.revertedWith(
            'No active auction exists with this id'
        );
    });
    it('calculates the minimum bid increase', async () => {
        const auctions = await fetchActiveSurplusAuctions(TEST_NETWORK);
        expect(auctions[0].id).to.equal(2328);
        const auction = auctions[0] as SurplusAuctionActive;

        const bid = await getNextMinimumBid(TEST_NETWORK, auction);
        expect(bid.toString()).to.equal('16.94241213279722952');
        expect(auction.bidAmountMKR.toString()).to.equal('16.290780896920413');
        const address = await createWalletFromPrivateKey(HARDHAT_PRIVATE_KEY, TEST_NETWORK);
        await setAllowanceAmountMKR(TEST_NETWORK, address, new BigNumber('20'));
        await swapToMKR(TEST_NETWORK, 20, 20);
        await bidToSurplusAuction(TEST_NETWORK, 2328, bid);
    });
});

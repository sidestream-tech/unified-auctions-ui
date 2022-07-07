import { expect } from 'chai';
import {
    fetchActiveSurplusAuctions,
    bidToSurplusAuction,
    collectSurplusAuction,
    fetchSurplusAuctionByIndex,
} from '../src/surplus';
import { setAllowanceAmountMKR } from '../src/authorizations';
import getSigner, { setSigner, createSigner } from '../src/signer';
import { getDevelopmentNetworkConig } from '../src/network';
import { swapToMKR } from './helpers/swap';

import { SurplusAuctionActive } from '../src/types';
import hre from 'hardhat';

const ALCHEMY_URL = process.env.ALCHEMY_URL;
const HARDHAT_PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'; // deterministic private key from hardhat.

async function createWalletFromPrivateKey(privateKey: string, network: string) {
    setSigner(network, createSigner(network, privateKey));
    const signer = await getSigner(network);
    return await signer.getAddress();
}

describe('Surplus Auction', () => {
    before(async () => {
        getDevelopmentNetworkConig(true);
    });
    beforeEach(async () => {
        await hre.network.provider.request({
            method: 'hardhat_reset',
            params: [
                {
                    forking: {
                        jsonRpcUrl: ALCHEMY_URL,
                        blockNumber: 14078339,
                    },
                },
            ],
        });
    });
    it('fetches active auctions', async () => {
        const auctions = await fetchActiveSurplusAuctions('localhost');
        expect(auctions.length).to.equal(5);
        expect(auctions[0].id).to.equal(2328);
        expect(auctions[0].state).to.equal('have-bids');
    });
    it('participates in active auction', async () => {
        const address = await createWalletFromPrivateKey(HARDHAT_PRIVATE_KEY, 'localhost');
        await setAllowanceAmountMKR('localhost', address);
        await swapToMKR('localhost', 20, 20);
        await bidToSurplusAuction('localhost', 2328, '20');
        const auctions = await fetchActiveSurplusAuctions('localhost');
        const currentAuction = auctions[0] as SurplusAuctionActive;
        expect(currentAuction.id).to.equal(2328);
        expect(currentAuction.bidAmountMKR.eq(20)).to.be.true;
    });
    it('collects the conluded auction', async () => {
        const auctionsBeforeCollection = await fetchActiveSurplusAuctions('localhost');
        expect(auctionsBeforeCollection.length).to.equal(5);
        expect(auctionsBeforeCollection[1].id).to.equal(2327);
        expect(auctionsBeforeCollection[1].state).to.equal('ready-for-collection');

        await collectSurplusAuction('localhost', auctionsBeforeCollection[1].id);

        const auctionAfterCollection = await fetchSurplusAuctionByIndex('localhost', 2327);
        expect(auctionAfterCollection.id).to.equal(2327);
        expect(auctionAfterCollection.state).to.equal('collected');
    });
});

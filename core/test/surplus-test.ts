import { expect } from 'chai';
import { fetchActiveSurplusAuctions, bidToSurplusAuction } from '../src/surplus';
import { setAllowanceAmountMKR } from '../src/authorizations';
import getSigner, { setSigner, createSigner } from '../src/signer';

import { SurplusAuctionActive } from '../src/types';
import hre from 'hardhat';

const ALCHEMY_URL = process.env.ALCHEMY_URL;
const HARDHAT_PRIVATE_KEY = '0x701b615bbdfb9de65240bc28bd21bbc0d996645a3dd57e7b12bc2bdf6f192c82'; // deterministic private key from hardhat.
async function createWalletFromPrivateKey(privateKey: string, network: string) {
    setSigner(network, createSigner(network, privateKey));
    const signer = await getSigner(network);
    return await signer.getAddress();
}

describe('Surplus Auction', () => {
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
        await bidToSurplusAuction('localhost', 2328, '21');
        const auctions = await fetchActiveSurplusAuctions('localhost');
        const currentAuction = auctions[0] as SurplusAuctionActive;
        expect(currentAuction.id).to.equal(2328);
        expect(currentAuction.bidAmountMKR).to.equal(21);
    });
});

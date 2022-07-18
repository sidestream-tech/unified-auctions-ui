import { expect } from 'chai';
import { setupRpcUrlAndGetNetworks } from '../src/rpc';
import { bidWithCallee, fetchAllAuctions, fetchSingleAuctionById, enrichAuction } from '../src/auctions';
import { fetchBalanceDAI } from '../src/wallet';
import { authorizeWallet, authorizeCollateral } from '../src/authorizations';
import { createWalletFromPrivateKey } from '../src/signer';
import BigNumber from '../src/bignumber';

import hre from 'hardhat';
import { Auction } from '../src/types';

const REMOTE_RPC_URL = process.env.REMOTE_RPC_URL;
const HARDHAT_PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'; // deterministic private key from hardhat.
const HARDHAT_FORK_BLOCK_NUMBER = 14052140;
const NETWORK = 'custom';

describe('Surplus auction profit calculation', () => {
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
    it('participates in collateral auction', async () => {
        const allAuctions = await fetchAllAuctions(NETWORK);
        expect(allAuctions.length).to.equal(7);
        const auction: Auction = allAuctions[2];
        const wallet = await createWalletFromPrivateKey(HARDHAT_PRIVATE_KEY, NETWORK);
        console.log('___________________');
        await authorizeWallet(NETWORK, wallet, false);
        await authorizeCollateral(NETWORK, wallet, auction.collateralType, false);
        const enrichedAuction = await enrichAuction(NETWORK, auction);
        const expectedProfit = enrichedAuction.transactionGrossProfit as BigNumber;
        await bidWithCallee(NETWORK, auction, wallet);
        expect(fetchSingleAuctionById(NETWORK, auction.id)).to.be.revertedWith('No active auction found with this id');
        const actualProfit = await fetchBalanceDAI(NETWORK, wallet);
        console.log('actual profit', actualProfit.toFixed());
        console.log('expected profit', expectedProfit.toFixed());

        const expectedTotalMarketPriceLimitedByDebt = actualProfit.plus(auction.debtDAI);
        const expectedCollateralAmountLimitedByDebt = expectedTotalMarketPriceLimitedByDebt.dividedBy(
            auction.marketUnitPrice as BigNumber
        );
        const accurateUnitPrice = auction.debtDAI.dividedBy(expectedCollateralAmountLimitedByDebt);
        console.log({
            expectedTotalMarketPriceLimitedByDebt: expectedTotalMarketPriceLimitedByDebt.toFixed(),
            expectedCollateralAmountLimitedByDebt: expectedCollateralAmountLimitedByDebt.toFixed(),
            accurateUnitPrice: accurateUnitPrice.toFixed(),
        });

        const errorRate = actualProfit.div(expectedProfit).minus(1).abs().toNumber();
        expect(errorRate).to.be.lessThan(0.01);
    });
});

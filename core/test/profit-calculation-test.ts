import { expect } from 'chai';
import { setupRpcUrlAndGetNetworks } from '../src/rpc';
import { bidWithCallee, fetchAllAuctions, fetchSingleAuctionById, enrichAuction } from '../src/auctions';
import { fetchBalanceDAI } from '../src/wallet';
import { authorizeWallet, authorizeCollateral } from '../src/authorizations';
import { createWalletFromPrivateKey } from '../src/signer';
import BigNumber from '../src/bignumber';
import TEST_PARAMETERS from './parametrization/profit-calculation-test.json';

import hre from 'hardhat';
import { Auction } from '../src/types';

import clearCache from './helpers/cache';

const REMOTE_RPC_URL = process.env.REMOTE_RPC_URL;
const HARDHAT_PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'; // deterministic private key from hardhat.
const NETWORK = 'custom';
const CACHED_FUNCTIONS = [authorizeWallet, authorizeCollateral];

interface TestParameters {
    blockNumber: number;
    auctionsExpected: number;
    auctionIndex: number;
}

type TestConfig = Record<string, TestParameters[]>;

const resetNetwork = async (blockNumber: string) => {
    const local_rpc_url = process.env.LOCAL_RPC_URL || 'http://localhost:8545';
    await setupRpcUrlAndGetNetworks(local_rpc_url);
    await hre.network.provider.request({
        method: 'hardhat_reset',
        params: [
            {
                forking: {
                    jsonRpcUrl: REMOTE_RPC_URL,
                    blockNumber: Number(blockNumber),
                },
            },
        ],
    });
};

Object.entries(TEST_PARAMETERS as TestConfig).forEach(([block, testConfig]) => {
    describe(`Collateral auction prediction precision.`, () => {
        beforeEach(async () => {
            clearCache(CACHED_FUNCTIONS);
            await resetNetwork(block);
        });
        testConfig.forEach(testParams => {
            it(`generates accurate prediction; Index: ${testParams.auctionIndex}, Block: ${testParams.blockNumber}`, async () => {
                const allAuctions = await fetchAllAuctions(NETWORK);
                expect(allAuctions.length).to.equal(testParams.auctionsExpected);
                const auction: Auction = allAuctions[testParams.auctionIndex];
                const wallet = await createWalletFromPrivateKey(HARDHAT_PRIVATE_KEY, NETWORK);
                const balaneBefore = await fetchBalanceDAI(NETWORK, wallet);

                await hre.network.provider.send('evm_increaseTime', [1]);
                await authorizeWallet(NETWORK, wallet, false);
                await hre.network.provider.send('evm_increaseTime', [1]);
                await authorizeCollateral(NETWORK, wallet, auction.collateralType, false);

                const enrichedAuction = await enrichAuction(NETWORK, auction);
                const expectedProfit = enrichedAuction.transactionGrossProfit as BigNumber;
                await bidWithCallee(NETWORK, auction, wallet);
                expect(fetchSingleAuctionById(NETWORK, auction.id)).to.be.revertedWith(
                    'No active auction found with this id'
                );
                const actualProfit = (await fetchBalanceDAI(NETWORK, wallet)).minus(balaneBefore);

                const errorRate = actualProfit.div(expectedProfit).minus(1).abs().toNumber();
                expect(errorRate).to.be.lessThan(0.01);
            });
        });
    });
});

import { expect } from 'chai';
import { setupRpcUrlAndGetNetworks } from '../src/rpc';
import {causeDebt} from './helpers/causeDebt'
import hre from 'hardhat'

describe('Debt Auction', () => {
    before(async () => {
        const local_rpc_url = process.env.LOCAL_RPC_URL || 'http://localhost:8545';
        await setupRpcUrlAndGetNetworks(local_rpc_url);
        const provider = hre.network.provider;

        await causeDebt('custom', provider)
    });
    it('exists', () => {
        expect(true).to.be.true;
    })
});

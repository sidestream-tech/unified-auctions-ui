import { expect } from 'chai';
import { convertMkrToDai } from '../src/calleeFunctions/helpers/uniswapV3';
import { setupRpcUrlAndGetNetworks } from '../src/rpc';
import BigNumber from '../src/bignumber';
import { resetNetwork } from './helpers/resetBlockchainFork';

const REMOTE_RPC_URL = process.env.REMOTE_RPC_URL || 'http://localhost:8545';
import { HARDHAT_FORK_BLOCK_NUMBER } from '../helpers/constants';

describe('Market Price & Conversions', () => {
    before(async () => {
        const local_rpc_url = process.env.LOCAL_RPC_URL || 'http://localhost:8545';
        await setupRpcUrlAndGetNetworks(local_rpc_url);
    });
    beforeEach(async () => {
        await resetNetwork(REMOTE_RPC_URL, HARDHAT_FORK_BLOCK_NUMBER);
    });
    it('gets MKR-DAI exchange rate with Uniswap v3', async () => {
        const rate = await convertMkrToDai('custom', new BigNumber(1));
        expect(rate.toString()).to.equal('1731.669387321259063176');
    });
});

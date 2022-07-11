import { expect } from 'chai';
import { convertMkrToDai } from '../src/calleeFunctions/helpers/uniswapV3';
import { getExchangeRateDaiMkr } from '../src/calleeFunctions/helpers/uniswapV2';
import { setupRpcUrlAndGetNetworks } from '../src/rpc';
import BigNumber from '../src/bignumber';

import hre from 'hardhat';

const REMOTE_RPC_URL = process.env.REMOTE_RPC_URL;
const HARDHAT_FORK_BLOCK_NUMBER = 14078339;

describe('Market Price & Conversions', () => {
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
    it('gets MKR-DAI exchange rate with Uniswap v2', async () => {
        const rate = await getExchangeRateDaiMkr('custom');
        expect(rate.toString()).to.equal('1830.403058138370068702471166175');
    });
    it('gets MKR-DAI exchange rate with Uniswap v3', async () => {
        const rate = await convertMkrToDai('custom', new BigNumber(1));
        expect(rate.toString()).to.equal('1731.669387321259063176');
    });
});

import { expect } from 'chai';
import { convertMkrToDai } from '../src/calleeFunctions/helpers/uniswapV3';
import { setupRpcUrlAndGetNetworks } from '../src/rpc';
import BigNumber from '../src/bignumber';
import { resetNetwork } from '../helpers/hardhat/network';
import { LOCAL_RPC_URL } from '../helpers/constants';

const HARDHAT_FORK_BLOCK_NUMBER = 22518357;

describe('Market Price & Conversions', () => {
    before(async () => {
        await setupRpcUrlAndGetNetworks(LOCAL_RPC_URL);
    });
    beforeEach(async () => {
        await resetNetwork(HARDHAT_FORK_BLOCK_NUMBER);
    });
    it('gets MKR-DAI exchange rate with Uniswap v3', async () => {
        const rate = await convertMkrToDai('custom', new BigNumber(1));
        expect('1603.731281061474261483').to.equal(rate.toString());
    });
});

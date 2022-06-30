import { expect } from 'chai';
import { fetchActiveSurplusAuctions } from '../src/surplus';
import hre from 'hardhat';

const ALCHEMY_URL = process.env.ALCHEMY_URL;

describe('Some', () => {
    it('tests', async () => {
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
        const contracts = await fetchActiveSurplusAuctions('localhost');
        expect(contracts.length).to.equal(5);
    });
});

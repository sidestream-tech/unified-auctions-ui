import { getOsmPrices } from '../src/vaults';
import { resetNetwork } from '../helpers/hardhat';
import { setupRpcUrlAndGetNetworks } from '../src/rpc';
import { LOCAL_RPC_URL, TEST_NETWORK } from '../helpers/constants';
import COLLATERALS from '../src/constants/COLLATERALS';

describe('Vaults', () => {
    before(async () => {
        await setupRpcUrlAndGetNetworks(LOCAL_RPC_URL);
    });
    beforeEach(async () => {
        resetNetwork(15502000);
    });
    it('fetches oracle prices', async () => {
        const ret = await getOsmPrices(TEST_NETWORK, 'ETH-A');
        const decimals = COLLATERALS['ETH-A'].decimals
        console.log(ret.nextUnitPrice.shiftedBy(-decimals).toFixed())
        console.log(ret.currentUnitPrice.shiftedBy(-decimals).toFixed())
    })
})

import { fetchVault, getVaultTransaction } from '../src/vaults';
import { resetNetwork } from '../helpers/hardhat';
import { setupRpcUrlAndGetNetworks } from '../src/rpc';
import { LOCAL_RPC_URL, TEST_NETWORK } from '../helpers/constants';
import {expect} from 'chai';
import { VaultTransactionLiquidated, VaultTransactionNotLiquidated } from '../src/types';

describe('Vaults', () => {
    before(async () => {
        await setupRpcUrlAndGetNetworks(LOCAL_RPC_URL);
    });
    it('Fetches not liquidatable vault', async () => {
        await resetNetwork(15502000);

        const vault = await fetchVault(TEST_NETWORK, 22025);
        const vaultTransaction = await getVaultTransaction(TEST_NETWORK, vault);
        expect(vaultTransaction.state).to.eq('not-liquidatable')
        const vaultTransactionLiquidatable = vaultTransaction as VaultTransactionNotLiquidated;
        expect(vaultTransactionLiquidatable.collateralType).to.eq('ETH-A')
        expect(vaultTransactionLiquidatable.address).to.eq('0x95dc6d7ED8991facab34159D8231e04247dfaf65')
        expect(vaultTransactionLiquidatable.debtDai.toFixed()).to.eq('32198315.88349647029073587039891649505768393987481484')
        expect(vaultTransactionLiquidatable.collateralAmount.toFixed()).to.eq('60266.446946772373610407')
        expect(vaultTransactionLiquidatable.nextPriceChange.toISOString()).to.eq('2022-09-09T10:00:00.000Z')
    });
    it('Fetches liquidated vault', async () => {
        await resetNetwork(14955398)

        const vault = await fetchVault(TEST_NETWORK, 7370)
        const vaultTransaction = await getVaultTransaction(TEST_NETWORK, vault) as VaultTransactionLiquidated;
        expect(vaultTransaction.state).to.eq('liquidated')
        expect(vaultTransaction.auctionId).to.eq(726)
        expect(vaultTransaction.liquidationDate.toISOString()).to.eq("2022-06-13T10:04:52.000Z")
    })
})

import { fetchVault, getVaultTransaction } from '../src/vaults';
import { resetNetwork } from '../helpers/hardhat';
import { setupRpcUrlAndGetNetworks } from '../src/rpc';
import { LOCAL_RPC_URL, TEST_NETWORK } from '../helpers/constants';
import { expect } from 'chai';
import { VaultTransactionLiquidated, VaultTransactionNotLiquidated } from '../src/types';
import BigNumber from '../src/bignumber';

describe('Vaults', () => {
    before(async () => {
        await setupRpcUrlAndGetNetworks(LOCAL_RPC_URL);
    });
    it('Fetches not liquidatable vault', async () => {
        await resetNetwork(15502000);

        const vault = await fetchVault(TEST_NETWORK, 22025);
        const vaultTransaction = await getVaultTransaction(TEST_NETWORK, vault);
        expect(vaultTransaction.state).to.eq('not-liquidatable');
        const vaultTransactionLiquidatable = vaultTransaction as VaultTransactionNotLiquidated;
        const expectedObject: VaultTransactionNotLiquidated = {
            state: 'not-liquidatable',
            collateralType: 'ETH-A',
            address: '0x95dc6d7ED8991facab34159D8231e04247dfaf65',
            network: TEST_NETWORK,

            lastSyncedAt: new Date(),
            nextPriceChange: new Date('2022-09-09T10:00:00.000Z'),

            liquidationRatio: 1.45,
            collateralizationRatio: 3.2047904306417108,
            proximityToLiquidation: 1.7547904306417108,
            id: 22025,

            incentiveCombinedDai: new BigNumber('32498.31588349647029073587039891649505768393987481484'),
            incentiveRelativeDai: new BigNumber('32198.31588349647029073587039891649505768393987481484'),
            incentiveConstantDai: new BigNumber('300'),
            grossProfitDai: new BigNumber('32498.31588349647029073587039891649505768393987481484'),
            netProfitDai: new BigNumber('32486.18554978440205213455373333148774614393987481484'),
            stabilityFeeRate: new BigNumber('1.077990181020998014318011624'),
            minUnitPrice: new BigNumber('1180.834957655172413793103448275'),
            maximumProtocolDebtDai: new BigNumber('100000000'),
            currentProtocolDebtDai: new BigNumber(0),
            currentCollateralDebtDai: new BigNumber(0),
            maximumCollateralDebtDai: new BigNumber(65000000),
            transactionFeeLiquidationEth: new BigNumber('0.00718871382525318'),
            transactionFeeLiquidationDai: new BigNumber('12.13033371206823860131666558500731154'),
            debtDai: new BigNumber('32198315.88349647029073587039891649505768393987481484'),
            collateralAmount: new BigNumber('60266.446946772373610407'),
            currentUnitPrice: new BigNumber('1712.2106886'),
            nextUnitPrice: new BigNumber('1698.4'),
            initialDebtDai: new BigNumber('29868839.670692031996967035'),
        };
        expect(expectedObject.state).to.eq(vaultTransactionLiquidatable.state);
        expect(expectedObject.collateralType).to.eq(vaultTransactionLiquidatable.collateralType);
        expect(expectedObject.address).to.eq(vaultTransactionLiquidatable.address);
        expect(expectedObject.network).to.eq(vaultTransactionLiquidatable.network);
        expect(expectedObject.nextPriceChange?.toISOString()).to.eq(
            vaultTransactionLiquidatable.nextPriceChange?.toISOString()
        );

        expect(expectedObject.liquidationRatio).to.eq(vaultTransactionLiquidatable.liquidationRatio);
        expect(expectedObject.collateralizationRatio).to.eq(vaultTransactionLiquidatable.collateralizationRatio);
        expect(expectedObject.proximityToLiquidation).to.eq(vaultTransactionLiquidatable.proximityToLiquidation);
        expect(expectedObject.id).to.eq(vaultTransactionLiquidatable.id),
            expect(expectedObject.incentiveCombinedDai.toFixed()).to.eq(
                vaultTransactionLiquidatable.incentiveCombinedDai.toFixed()
            );
        expect(expectedObject.incentiveRelativeDai.toFixed()).to.eq(
            vaultTransactionLiquidatable.incentiveRelativeDai.toFixed()
        );
        expect(expectedObject.incentiveConstantDai.toFixed()).to.eq(
            vaultTransactionLiquidatable.incentiveConstantDai.toFixed()
        );
        expect(expectedObject.grossProfitDai.toFixed()).to.eq(vaultTransactionLiquidatable.grossProfitDai.toFixed());
        expect(expectedObject.netProfitDai.toFixed()).to.eq(vaultTransactionLiquidatable.netProfitDai.toFixed());
        expect(expectedObject.stabilityFeeRate.toFixed()).to.eq(
            vaultTransactionLiquidatable.stabilityFeeRate.toFixed()
        );
        expect(expectedObject.minUnitPrice.toFixed()).to.eq(vaultTransactionLiquidatable.minUnitPrice.toFixed());
        expect(expectedObject.maximumProtocolDebtDai.toFixed()).to.eq(
            vaultTransactionLiquidatable.maximumProtocolDebtDai.toFixed()
        );
        expect(expectedObject.currentProtocolDebtDai.toFixed()).to.eq(
            vaultTransactionLiquidatable.currentProtocolDebtDai.toFixed()
        );
        expect(expectedObject.currentCollateralDebtDai.toFixed()).to.eq(
            vaultTransactionLiquidatable.currentCollateralDebtDai.toFixed()
        );
        expect(expectedObject.maximumCollateralDebtDai.toFixed()).to.eq(
            vaultTransactionLiquidatable.maximumCollateralDebtDai.toFixed()
        );
        expect(expectedObject.transactionFeeLiquidationEth.toFixed()).to.eq(
            vaultTransactionLiquidatable.transactionFeeLiquidationEth.toFixed()
        );
        expect(expectedObject.transactionFeeLiquidationDai.toFixed()).to.eq(
            vaultTransactionLiquidatable.transactionFeeLiquidationDai.toFixed()
        );
        expect(expectedObject.debtDai.toFixed()).to.eq(vaultTransactionLiquidatable.debtDai.toFixed());
        expect(expectedObject.collateralAmount.toFixed()).to.eq(
            vaultTransactionLiquidatable.collateralAmount.toFixed()
        );
        expect(expectedObject.currentUnitPrice?.toFixed()).to.eq(
            vaultTransactionLiquidatable.currentUnitPrice?.toFixed()
        );
        expect(expectedObject.nextUnitPrice?.toFixed()).to.eq(vaultTransactionLiquidatable.nextUnitPrice?.toFixed());
        expect(expectedObject.initialDebtDai.toFixed()).to.eq(vaultTransactionLiquidatable.initialDebtDai.toFixed());
    });
    it('Fetches liquidated vault', async () => {
        await resetNetwork(14955398);

        const vault = await fetchVault(TEST_NETWORK, 7370);
        const vaultTransaction = (await getVaultTransaction(TEST_NETWORK, vault)) as VaultTransactionLiquidated;
        expect(vaultTransaction.state).to.eq('liquidated');
        expect(vaultTransaction.auctionId).to.eq('726');
        expect(vaultTransaction.transactionHash).to.eq(
            '0x3f66c60e348c8df6da2ed4474e212be13401a865bca4a35d046be44fc2f3f1b9'
        );
        expect(vaultTransaction.liquidationDate.toISOString()).to.eq('2022-06-13T10:04:52.000Z');
    });
    it('Fetches non-liquidated vault', async () => {
        await resetNetwork(14955381);

        const vault = await fetchVault(TEST_NETWORK, 27435);

        const vaultTransaction = (await getVaultTransaction(TEST_NETWORK, vault)) as VaultTransactionLiquidated;
        const vaultTransactionNotLiquidated = vaultTransaction as unknown as VaultTransactionNotLiquidated;
        const expectedObject: VaultTransactionNotLiquidated = {
            state: 'liquidatable',
            collateralType: 'ETH-C',
            address: '0x50A10041A113f8dF54EAf7f9f49F03c1Eb6B45bc',
            network: TEST_NETWORK,

            lastSyncedAt: new Date(),
            nextPriceChange: new Date('2022-06-13T11:00:00.000Z'),

            liquidationRatio: 1.7,
            collateralizationRatio: 1.698313241866927,
            proximityToLiquidation: -0.001686758133073063,
            id: 27435,

            incentiveCombinedDai: new BigNumber('308.973717449711589422115275593184791275895341629034'),
            incentiveRelativeDai: new BigNumber('8.973717449711589422115275593184791275895341629034'),
            incentiveConstantDai: new BigNumber('300'),
            grossProfitDai: new BigNumber('308.973717449711589422115275593184791275895341629034'),
            netProfitDai: new BigNumber('296.843383737643350820798610008177479735895341629034'),
            stabilityFeeRate: new BigNumber('1.013829372344109723319869134'),
            minUnitPrice: new BigNumber('721.804640220588235294117647058'),
            maximumProtocolDebtDai: new BigNumber('100000000'),
            currentProtocolDebtDai: new BigNumber(0),
            currentCollateralDebtDai: new BigNumber('105882.900090330108539882708255451806124201305822084'),
            maximumCollateralDebtDai: new BigNumber(35000000),
            transactionFeeLiquidationEth: new BigNumber('0.00718871382525318'),
            transactionFeeLiquidationDai: new BigNumber('12.13033371206823860131666558500731154'),
            debtDai: new BigNumber('8973.717449711589422115275593184791275895341629034'),
            collateralAmount: new BigNumber('12.42'),
            currentUnitPrice: new BigNumber('1227.067888375'),
            nextUnitPrice: undefined,
            initialDebtDai: new BigNumber('8851.309396336731694851'),
        };
        expect(expectedObject.state).to.eq(vaultTransactionNotLiquidated.state);
        expect(expectedObject.collateralType).to.eq(vaultTransactionNotLiquidated.collateralType);
        expect(expectedObject.address).to.eq(vaultTransactionNotLiquidated.address);
        expect(expectedObject.network).to.eq(vaultTransactionNotLiquidated.network);
        expect(expectedObject.nextPriceChange?.toISOString()).to.eq(
            vaultTransactionNotLiquidated.nextPriceChange?.toISOString()
        );

        expect(expectedObject.liquidationRatio).to.eq(vaultTransactionNotLiquidated.liquidationRatio);
        expect(expectedObject.collateralizationRatio).to.eq(vaultTransactionNotLiquidated.collateralizationRatio);
        expect(expectedObject.proximityToLiquidation).to.eq(vaultTransactionNotLiquidated.proximityToLiquidation);
        expect(expectedObject.id).to.eq(vaultTransactionNotLiquidated.id),
            expect(expectedObject.incentiveCombinedDai.toFixed()).to.eq(
                vaultTransactionNotLiquidated.incentiveCombinedDai.toFixed()
            );
        expect(expectedObject.incentiveRelativeDai.toFixed()).to.eq(
            vaultTransactionNotLiquidated.incentiveRelativeDai.toFixed()
        );
        expect(expectedObject.incentiveConstantDai.toFixed()).to.eq(
            vaultTransactionNotLiquidated.incentiveConstantDai.toFixed()
        );
        expect(expectedObject.grossProfitDai.toFixed()).to.eq(vaultTransactionNotLiquidated.grossProfitDai.toFixed());
        expect(expectedObject.netProfitDai.toFixed()).to.eq(vaultTransactionNotLiquidated.netProfitDai.toFixed());
        expect(expectedObject.stabilityFeeRate.toFixed()).to.eq(
            vaultTransactionNotLiquidated.stabilityFeeRate.toFixed()
        );
        expect(expectedObject.minUnitPrice.toFixed()).to.eq(vaultTransactionNotLiquidated.minUnitPrice.toFixed());
        expect(expectedObject.maximumProtocolDebtDai.toFixed()).to.eq(
            vaultTransactionNotLiquidated.maximumProtocolDebtDai.toFixed()
        );
        expect(expectedObject.currentProtocolDebtDai.toFixed()).to.eq(
            vaultTransactionNotLiquidated.currentProtocolDebtDai.toFixed()
        );
        expect(expectedObject.currentCollateralDebtDai.toFixed()).to.eq(
            vaultTransactionNotLiquidated.currentCollateralDebtDai.toFixed()
        );
        expect(expectedObject.maximumCollateralDebtDai.toFixed()).to.eq(
            vaultTransactionNotLiquidated.maximumCollateralDebtDai.toFixed()
        );
        expect(expectedObject.transactionFeeLiquidationEth.toFixed()).to.eq(
            vaultTransactionNotLiquidated.transactionFeeLiquidationEth.toFixed()
        );
        expect(expectedObject.transactionFeeLiquidationDai.toFixed()).to.eq(
            vaultTransactionNotLiquidated.transactionFeeLiquidationDai.toFixed()
        );
        expect(expectedObject.debtDai.toFixed()).to.eq(vaultTransactionNotLiquidated.debtDai.toFixed());
        expect(expectedObject.collateralAmount.toFixed()).to.eq(
            vaultTransactionNotLiquidated.collateralAmount.toFixed()
        );
        expect(expectedObject.currentUnitPrice?.toFixed()).to.eq(
            vaultTransactionNotLiquidated.currentUnitPrice?.toFixed()
        );
        expect(expectedObject.nextUnitPrice).to.be.undefined;
        expect(expectedObject.initialDebtDai.toFixed()).to.eq(vaultTransactionNotLiquidated.initialDebtDai.toFixed());
    });
});

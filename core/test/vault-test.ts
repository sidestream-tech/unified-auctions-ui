import {
    collectStabilityFees,
    fetchLiquidationRatioAndOracleAddress,
    fetchVault,
    getVaultTransaction,
    liquidateVault,
} from '../src/vaults';
import { getOsmPrices } from '../src/oracles';
import { createWalletForRpc, resetNetwork, warpTime } from '../helpers/hardhat/network';
import { setupRpcUrlAndGetNetworks } from '../src/rpc';
import { HARDHAT_PRIVATE_KEY, HARDHAT_PUBLIC_KEY, LOCAL_RPC_URL, TEST_NETWORK } from '../helpers/constants';
import { expect } from 'chai';
import { VaultTransactionLiquidated, VaultTransactionNotLiquidated, Vault, CollateralType } from '../src/types';
import BigNumber from '../src/bignumber';
import { createWalletFromPrivateKey } from '../src/signer';
import deepEqualInAnyOrder from 'deep-equal-in-any-order';
import chai from 'chai';
import { fetchAuctionByCollateralTypeAndAuctionIndex } from '../src/fetch';
import { fetchVATbalanceDAI } from '../src/wallet';
import createVaultWithCollateral, {
    adjustLimitsAndRates,
    calculateMinCollateralAmountToOpenVault,
    getLiquidatableCollateralTypes,
} from '../simulations/helpers/createVaultWithCollateral';
import { NULL_ADDRESS } from '../src/constants/UNITS';
chai.use(deepEqualInAnyOrder);

const compareVaultTransactionsNotLiquidated = (
    expected: VaultTransactionNotLiquidated,
    actual: VaultTransactionNotLiquidated
) => {
    expect(expected.state).to.eq(actual.state);
    expect(expected.collateralType).to.eq(actual.collateralType);
    expect(expected.address).to.eq(actual.address);
    expect(expected.network).to.eq(actual.network);
    expect(expected.nextPriceChange).to.deep.equalInAnyOrder(actual.nextPriceChange);

    expect(expected.liquidationRatio).to.deep.equalInAnyOrder(actual.liquidationRatio);
    expect(expected.collateralizationRatio).to.deep.equalInAnyOrder(actual.collateralizationRatio);
    expect(expected.proximityToLiquidation).to.deep.equalInAnyOrder(actual.proximityToLiquidation);
    expect(expected.id).to.eq(actual.id);
    expect(expected.incentiveCombinedDai).to.deep.equalInAnyOrder(actual.incentiveCombinedDai);
    expect(expected.incentiveRelativeDai).to.deep.equalInAnyOrder(actual.incentiveRelativeDai);
    expect(expected.incentiveConstantDai).to.deep.equalInAnyOrder(actual.incentiveConstantDai);
    expect(expected.grossProfitDai).to.deep.equalInAnyOrder(actual.grossProfitDai);
    // TODO: enable the check and fix the bug with inconsistent price received
    // expect(expected.netProfitDai).to.deep.equalInAnyOrder(actual.netProfitDai);
    expect(expected.stabilityFeeRate).to.deep.equalInAnyOrder(actual.stabilityFeeRate);
    expect(expected.minUnitPrice).to.deep.equalInAnyOrder(actual.minUnitPrice);
    expect(expected.maximumProtocolDebtDai).to.deep.equalInAnyOrder(actual.maximumProtocolDebtDai);
    expect(expected.currentProtocolDebtDai).to.deep.equalInAnyOrder(actual.currentProtocolDebtDai);
    expect(expected.currentCollateralDebtDai).to.deep.equalInAnyOrder(actual.currentCollateralDebtDai);
    expect(expected.maximumCollateralDebtDai).to.deep.equalInAnyOrder(actual.maximumCollateralDebtDai);
    expect(expected.debtDai).to.deep.equalInAnyOrder(actual.debtDai);
    expect(expected.collateralAmount).to.deep.equalInAnyOrder(actual.collateralAmount);
    expect(expected.currentUnitPrice).to.deep.equalInAnyOrder(actual.currentUnitPrice);
    expect(expected.nextUnitPrice).to.deep.equalInAnyOrder(actual.nextUnitPrice);
    expect(expected.initialDebtDai).to.deep.equalInAnyOrder(actual.initialDebtDai);
    expect(expected.liquidationPenaltyRatio).to.deep.equalInAnyOrder(actual.liquidationPenaltyRatio);
    expect(expected.minimalAuctionedDai).to.deep.equalInAnyOrder(actual.minimalAuctionedDai);
};

describe('Vaults', () => {
    before(async () => {
        await setupRpcUrlAndGetNetworks(LOCAL_RPC_URL);
    });
    it('Fetches not liquidatable vault', async () => {
        await resetNetwork(15502000);

        const vault = await fetchVault(TEST_NETWORK, 22025);
        const vaultTransactionLiquidatable = (await getVaultTransaction(
            TEST_NETWORK,
            vault
        )) as VaultTransactionNotLiquidated;
        const expectedObject: VaultTransactionNotLiquidated = {
            state: 'not-liquidatable',
            collateralType: 'ETH-A',
            address: '0x95dc6d7ED8991facab34159D8231e04247dfaf65',
            network: TEST_NETWORK,

            lastSyncedAt: new Date(),
            nextPriceChange: new Date('2022-09-09T10:00:00.000Z'),

            liquidationRatio: new BigNumber('1.45'),
            collateralizationRatio: new BigNumber('3.204790430641710905476031356'),
            proximityToLiquidation: new BigNumber('0.547552318511616565008415095'),
            liquidationPenaltyRatio: new BigNumber('1.13'),
            minimalAuctionedDai: new BigNumber('15000'),
            id: 22025,

            incentiveCombinedDai: new BigNumber('34051.78882788199615657274955'),
            incentiveRelativeDai: new BigNumber('33751.78882788199615657274955'),
            incentiveConstantDai: new BigNumber('300'),
            grossProfitDai: new BigNumber('34051.78882788199615657274955'),
            netProfitDai: new BigNumber('34050.658282683546927424640855005903328826'),
            stabilityFeeRate: new BigNumber('1.077990181020998014318011624'),
            minUnitPrice: new BigNumber('1180.834957655172413793103448275'),
            maximumProtocolDebtDai: new BigNumber('100000000'),
            currentProtocolDebtDai: new BigNumber(0),
            currentCollateralDebtDai: new BigNumber(0),
            maximumCollateralDebtDai: new BigNumber(65000000),
            transactionFeeLiquidationEth: new BigNumber('0.000669987000446658'),
            transactionFeeLiquidationDai: new BigNumber('1.130545198449229148108694994096671174'),
            debtDai: new BigNumber('32198315.88349647029073587039891649505768393987481484'),
            collateralAmount: new BigNumber('60266.446946772373610407'),
            currentUnitPrice: new BigNumber('1712.2106886'),
            nextUnitPrice: new BigNumber('1712.2106886'),
            initialDebtDai: new BigNumber('29868839.670692031996967035'),
        };
        compareVaultTransactionsNotLiquidated(expectedObject, vaultTransactionLiquidatable);
    });
    it('Fetches liquidated vault', async () => {
        await resetNetwork(14955398);

        const vault = await fetchVault(TEST_NETWORK, 7370);
        const vaultTransaction = (await getVaultTransaction(TEST_NETWORK, vault)) as VaultTransactionLiquidated;
        expect(vaultTransaction.state).to.eq('liquidated');
        expect(vaultTransaction.pastLiquidations[0].auctionId).to.eq('ETH-A:726');
        expect(vaultTransaction.pastLiquidations[0].transactionHash).to.eq(
            '0x3f66c60e348c8df6da2ed4474e212be13401a865bca4a35d046be44fc2f3f1b9'
        );
        expect(vaultTransaction.pastLiquidations[0].liquidationDate.toISOString()).to.eq('2022-06-13T10:04:52.000Z');
    });
    it('Fetches non-liquidated vault', async () => {
        await resetNetwork(14955381);
        await createWalletFromPrivateKey(HARDHAT_PRIVATE_KEY, TEST_NETWORK);

        const vault = await fetchVault(TEST_NETWORK, 27435);

        const vaultTransactionNotLiquidated = (await getVaultTransaction(
            TEST_NETWORK,
            vault
        )) as VaultTransactionNotLiquidated;
        const expectedObject: VaultTransactionNotLiquidated = {
            state: 'liquidatable',
            collateralType: 'ETH-C',
            address: '0x50A10041A113f8dF54EAf7f9f49F03c1Eb6B45bc',
            network: TEST_NETWORK,

            lastSyncedAt: new Date(),
            nextPriceChange: new Date('2022-06-13T11:00:00.000Z'),

            liquidationRatio: new BigNumber(1.7),
            collateralizationRatio: new BigNumber('1.698313241866926788910221381'),
            proximityToLiquidation: new BigNumber('-0.000993196126304112564617121'),
            liquidationPenaltyRatio: new BigNumber('1.13'),
            minimalAuctionedDai: new BigNumber('5000'),
            id: 27435,

            incentiveCombinedDai: new BigNumber('310.00197961786050681518163'),
            incentiveRelativeDai: new BigNumber('10.00197961786050681518163'),
            incentiveConstantDai: new BigNumber('300'),
            grossProfitDai: new BigNumber('310.00197961786050681518163'),
            netProfitDai: new BigNumber('308.871434419411277667072935005903328826'),
            stabilityFeeRate: new BigNumber('1.013829372344109723319869134'),
            minUnitPrice: new BigNumber('721.804640220588235294117647058'),
            maximumProtocolDebtDai: new BigNumber('100000000'),
            currentProtocolDebtDai: new BigNumber(0),
            currentCollateralDebtDai: new BigNumber('105882.900090330108539882708255451806124201305822084'),
            maximumCollateralDebtDai: new BigNumber(35000000),
            transactionFeeLiquidationEth: new BigNumber('0.000669987000446658'),
            transactionFeeLiquidationDai: new BigNumber('1.130545198449229148108694994096671174'),
            debtDai: new BigNumber('8973.717449711589422115275593184791275895341629034'),
            collateralAmount: new BigNumber('12.42'),
            currentUnitPrice: new BigNumber('1227.067888375'),
            nextUnitPrice: new BigNumber('1208.0159951'),
            initialDebtDai: new BigNumber('8851.309396336731694851'),
        };
        compareVaultTransactionsNotLiquidated(expectedObject, vaultTransactionNotLiquidated);
        const vatBalanceBefore = await fetchVATbalanceDAI(TEST_NETWORK, HARDHAT_PUBLIC_KEY);
        await liquidateVault(
            TEST_NETWORK,
            vaultTransactionNotLiquidated.collateralType,
            vaultTransactionNotLiquidated.address,
            HARDHAT_PUBLIC_KEY
        );
        const updatedVault = (await fetchVault(TEST_NETWORK, 27435)) as Vault;
        expect(updatedVault.collateralAmount.toFixed()).to.eq('0');
        expect(updatedVault.initialDebtDai.toFixed()).to.eq('0');
        const updatedVaultTransaction = (await getVaultTransaction(
            TEST_NETWORK,
            updatedVault
        )) as VaultTransactionLiquidated;
        expect(updatedVaultTransaction.state).to.eq('liquidated');
        const [collateralType, auctionId] = updatedVaultTransaction.pastLiquidations[0].auctionId.split(':');
        const liquidationAuction = await fetchAuctionByCollateralTypeAndAuctionIndex(
            TEST_NETWORK,
            collateralType,
            parseInt(auctionId)
        );
        expect(liquidationAuction.collateralAmount).to.deep.equalInAnyOrder(
            vaultTransactionNotLiquidated.collateralAmount
        );
        expect(liquidationAuction.debtDAI.toPrecision(8)).to.deep.equalInAnyOrder(
            expectedObject.debtDai.multipliedBy(expectedObject.liquidationPenaltyRatio).toPrecision(8)
        );
        const vatBalanceAfter = await fetchVATbalanceDAI(TEST_NETWORK, HARDHAT_PUBLIC_KEY);
        // compare with gross proit because the fees are deducted from the wallet and the incentive is sent to VAT
        expect(vatBalanceAfter.minus(vatBalanceBefore).toPrecision(3)).to.deep.equalInAnyOrder(
            vaultTransactionNotLiquidated.grossProfitDai.toPrecision(3)
        );
    });
});
describe('Sound values are extracted', () => {
    before(async () => {
        await setupRpcUrlAndGetNetworks(LOCAL_RPC_URL);
        await resetNetwork(15533000);
    });
    const expectedReturn: Record<
        CollateralType,
        { nextUnitPrice: string; currentUnitPrice: string; nextPriceChange: Date }
    > = {
        'AAVE-A': {
            nextUnitPrice: '150.79237464128204',
            currentUnitPrice: '150.79237464128204',
            nextPriceChange: new Date('2022-01-23T22:00:00.000Z'),
        },
        'BAL-A': {
            currentUnitPrice: '11.80800329930906',
            nextUnitPrice: '11.721140147069267',
            nextPriceChange: new Date('2022-01-23T19:00:00.000Z'),
        },
        'BAT-A': {
            nextUnitPrice: '0.73',
            currentUnitPrice: '0.71910538308',
            nextPriceChange: new Date('2022-01-23T19:00:00.000Z'),
        },
        'COMP-A': {
            nextUnitPrice: '124.5640565401381',
            currentUnitPrice: '124.5640565401381',
            nextPriceChange: new Date('2022-01-23T22:00:00.000Z'),
        },
        'ETH-A': {
            nextUnitPrice: '1712.2106886',
            currentUnitPrice: '1712.2106886',
            nextPriceChange: new Date('2022-09-09T10:00:00.000Z'),
        },
        'ETH-B': {
            nextUnitPrice: '1602.1803800999999',
            currentUnitPrice: '1602.1803800999999',
            nextPriceChange: new Date('2022-09-14T13:00:00.000Z'),
        },
        'ETH-C': {
            nextUnitPrice: '1208.0159951',
            currentUnitPrice: '1227.067888375',
            nextPriceChange: new Date('2022-06-13T11:00:00.000Z'),
        },
        'GUSD-A': {
            nextUnitPrice: 'NaN',
            currentUnitPrice: '1',
            nextPriceChange: new Date(NaN),
        },
        'KNC-A': {
            nextUnitPrice: '1.5108',
            currentUnitPrice: '1.4869',
            nextPriceChange: new Date('2021-10-28T05:00:00.000Z'),
        },
        'LINK-A': {
            nextUnitPrice: '7.2245',
            currentUnitPrice: '7.159627035',
            nextPriceChange: new Date('2022-09-14T13:00:00.000Z'),
        },
        'LRC-A': {
            nextUnitPrice: '0.8117493344000001',
            currentUnitPrice: '0.7270649846852948',
            nextPriceChange: new Date('2022-01-23T19:00:00.000Z'),
        },
        'MANA-A': {
            nextUnitPrice: '0.73075',
            currentUnitPrice: '0.73075',
            nextPriceChange: new Date('2022-09-14T13:00:00.000Z'),
        },
        'PAXUSD-A': {
            nextUnitPrice: 'NaN',
            currentUnitPrice: '1',
            nextPriceChange: new Date(NaN),
        },
        'RENBTC-A': {
            nextUnitPrice: '20388.465',
            currentUnitPrice: '20388.465',
            nextPriceChange: new Date('2022-09-14T13:00:00.000Z'),
        },
        'TUSD-A': {
            nextUnitPrice: 'NaN',
            currentUnitPrice: '1',
            nextPriceChange: new Date(NaN),
        },
        'UNI-A': {
            nextUnitPrice: '6.1622020819',
            currentUnitPrice: '5.103855836',
            nextPriceChange: new Date('2022-07-11T16:00:00.000Z'),
        },
        'USDC-A': {
            nextUnitPrice: 'NaN',
            currentUnitPrice: '1',
            nextPriceChange: new Date(NaN),
        },
        'USDC-B': {
            nextUnitPrice: 'NaN',
            currentUnitPrice: '1',
            nextPriceChange: new Date(NaN),
        },
        'USDT-A': {
            nextUnitPrice: '1.0007712772150232',
            currentUnitPrice: '1.0007712772150232',
            nextPriceChange: new Date('2021-10-28T05:00:00.000Z'),
        },
        'WBTC-A': {
            nextUnitPrice: '20388.465',
            currentUnitPrice: '20388.465',
            nextPriceChange: new Date('2022-09-14T13:00:00.000Z'),
        },
        'WBTC-B': {
            nextUnitPrice: '20388.465',
            currentUnitPrice: '20388.465',
            nextPriceChange: new Date('2022-09-14T13:00:00.000Z'),
        },
        'WBTC-C': {
            nextUnitPrice: '20388.465',
            currentUnitPrice: '20388.465',
            nextPriceChange: new Date('2022-09-14T13:00:00.000Z'),
        },
        'YFI-A': {
            nextUnitPrice: '9150',
            currentUnitPrice: '9185.8368',
            nextPriceChange: new Date('2022-09-14T13:00:00.000Z'),
        },
        'ZRX-A': {
            nextUnitPrice: '0.54008',
            currentUnitPrice: '0.50224',
            nextPriceChange: new Date('2022-01-23T19:00:00.000Z'),
        },
        'MATIC-A': {
            nextUnitPrice: '0.859281',
            currentUnitPrice: '0.859281',
            nextPriceChange: new Date('2022-09-14T13:00:00.000Z'),
        },
        'WSTETH-A': {
            nextUnitPrice: '1687.84305547955',
            currentUnitPrice: '1687.84305547955',
            nextPriceChange: new Date('2022-09-14T13:00:00.000Z'),
        },
        'WSTETH-B': {
            nextUnitPrice: '1687.84305547955',
            currentUnitPrice: '1687.84305547955',
            nextPriceChange: new Date('2022-09-14T13:00:00.000Z'),
        },
        'CRVV1ETHSTETH-A': {
            nextUnitPrice: '1633.547452878850724671',
            currentUnitPrice: '1645.994835125363651071',
            nextPriceChange: new Date('2022-09-14T12:01:47.000Z'),
        },
        'UNIV2DAIETH-A': {
            nextUnitPrice: '111.536694644490420563',
            currentUnitPrice: '115.716445113160358543',
            nextPriceChange: new Date('2022-07-13T17:00:03.000Z'),
        },
        'UNIV2USDCETH-A': {
            nextUnitPrice: '164916785.176105260363204747',
            currentUnitPrice: '165534555.801045344024651968',
            nextPriceChange: new Date('2022-09-14T12:01:47.000Z'),
        },
        'UNIV2ETHUSDT-A': {
            nextUnitPrice: '228116379.650719357480121186',
            currentUnitPrice: '230190196.687438171219371005',
            nextPriceChange: new Date('2021-10-28T04:01:15.000Z'),
        },
        'UNIV2WBTCDAI-A': {
            nextUnitPrice: '31892330.725591269457933196',
            currentUnitPrice: '32196608.076982062517168305',
            nextPriceChange: new Date('2022-07-11T16:09:40.000Z'),
        },
        'UNIV2WBTCETH-A': {
            nextUnitPrice: '1102874511.239936578199968093',
            currentUnitPrice: '1175008223.21111667836061111',
            nextPriceChange: new Date('2022-07-13T17:00:03.000Z'),
        },
        'UNIV2LINKETH-A': {
            nextUnitPrice: '567.672642511519510798',
            currentUnitPrice: '566.984073123537837073',
            nextPriceChange: new Date('2022-01-23T19:01:00.000Z'),
        },
        'UNIV2UNIETH-A': {
            nextUnitPrice: '368.441439820843276851',
            currentUnitPrice: '327.117645258478197955',
            nextPriceChange: new Date('2022-07-11T16:09:40.000Z'),
        },
        'UNIV2AAVEETH-A': {
            nextUnitPrice: '2503.767176345875098159',
            currentUnitPrice: '2529.450702467409881126',
            nextPriceChange: new Date('2021-11-22T23:04:46.000Z'),
        },
        'UNIV2DAIUSDT-A': {
            nextUnitPrice: '2274141.032812901837192665',
            currentUnitPrice: '2274109.765292120125373109',
            nextPriceChange: new Date('2021-10-28T04:01:15.000Z'),
        },
        'UNIV2DAIUSDC-A': {
            nextUnitPrice: '2252657.773463853818331742',
            currentUnitPrice: '2252657.773463853818331742',
            nextPriceChange: new Date('2022-09-14T12:01:47.000Z'),
        },
    };
    for (const type of getLiquidatableCollateralTypes()) {
        it(`can reach ${type} oracle`, async () => {
            const liquidationRatioAndAddress = await fetchLiquidationRatioAndOracleAddress(TEST_NETWORK, type);
            expect(liquidationRatioAndAddress.oracleAddress).not.to.eq(NULL_ADDRESS);
            const prices = await getOsmPrices(TEST_NETWORK, liquidationRatioAndAddress.oracleAddress, type);
            expect(expectedReturn[type].currentUnitPrice).to.eq(prices.currentUnitPrice.toFixed());
            if (expectedReturn[type].nextPriceChange.getTime()) {
                expect(expectedReturn[type].nextPriceChange.toISOString()).to.eq(prices.nextPriceChange.toISOString());
            } else {
                expect(prices.nextPriceChange.getTime()).to.be.NaN;
            }
            expect(expectedReturn[type].nextUnitPrice).to.eq(prices.nextUnitPrice.toFixed());
        });
    }
});

describe(`Collateral vault simulation liquidation `, () => {
    before(async () => {
        await createWalletForRpc();
        await resetNetwork();
    });
    for (const collateralType of getLiquidatableCollateralTypes()) {
        it(`runs the simulaton for ${collateralType}`, async () => {
            let collateralOwned: BigNumber;
            await adjustLimitsAndRates(collateralType);
            try {
                collateralOwned = await calculateMinCollateralAmountToOpenVault(collateralType);
            } catch (e) {
                if (e instanceof Error && e.message.endsWith('max debt set to zero')) {
                    return;
                }
                throw e;
            }
            let vaultId: number;
            try {
                vaultId = await createVaultWithCollateral(collateralType, collateralOwned);
            } catch (e) {
                if (e instanceof Error && e.message === 'Could not borrow dai because debt ceiling is exceeded.') {
                    return;
                }
                throw e;
            }

            const vault = await fetchVault(TEST_NETWORK, vaultId);
            expect(vault.collateralAmount.toFixed(0)).to.eq(collateralOwned.toFixed(0));

            const previousStabilityFee = vault.stabilityFeeRate;
            await warpTime(60 * 24 * 30 * 12 * 2, 60);
            await collectStabilityFees(TEST_NETWORK, vault.collateralType);
            const currentStabilityFee = (await fetchVault(TEST_NETWORK, vaultId)).stabilityFeeRate;
            if (!currentStabilityFee.gt(previousStabilityFee)) {
                throw new Error('Successful vault creation, but stability fees did not change after time warp');
            }

            await liquidateVault(TEST_NETWORK, vault.collateralType, vault.address);
        });
    }
});

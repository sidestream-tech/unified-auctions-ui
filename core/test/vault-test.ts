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
import { overwriteCurrentOraclePrice } from '../helpers/hardhat/overwrites';
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

    expect(expected.liquidationRatio.toFixed()).to.eq(actual.liquidationRatio.toFixed());
    expect(expected.collateralizationRatio.toFixed()).to.eq(actual.collateralizationRatio.toFixed());
    expect(expected.proximityToLiquidation.toFixed()).to.eq(actual.proximityToLiquidation.toFixed());
    expect(expected.incentiveCombinedDai.toFixed()).to.eq(actual.incentiveCombinedDai.toFixed());
    expect(expected.incentiveRelativeDai.toFixed()).to.eq(actual.incentiveRelativeDai.toFixed());
    expect(expected.incentiveConstantDai.toFixed()).to.eq(actual.incentiveConstantDai.toFixed());
    expect(expected.grossProfitDai.toFixed()).to.eq(actual.grossProfitDai.toFixed());
    // TODO: enable the check and fix the bug with inconsistent price received
    // expect(expected.netProfitDai.toFixed()).to.eq(actual.netProfitDai.toFixed());
    expect(expected.stabilityFeeRate.toFixed()).to.eq(actual.stabilityFeeRate.toFixed());
    expect(expected.minUnitPrice.toFixed()).to.eq(actual.minUnitPrice.toFixed());
    expect(expected.maximumProtocolDebtDai.toFixed()).to.eq(actual.maximumProtocolDebtDai.toFixed());
    expect(expected.currentProtocolDebtDai.toFixed()).to.eq(actual.currentProtocolDebtDai.toFixed());
    expect(expected.currentCollateralDebtDai.toFixed()).to.eq(actual.currentCollateralDebtDai.toFixed());
    expect(expected.maximumCollateralDebtDai.toFixed()).to.eq(actual.maximumCollateralDebtDai.toFixed());
    expect(expected.debtDai.toFixed()).to.eq(actual.debtDai.toFixed());
    expect(expected.collateralAmount.toFixed()).to.eq(actual.collateralAmount.toFixed());
    expect(expected.currentUnitPrice.toFixed()).to.eq(actual.currentUnitPrice.toFixed());
    expect(expected.nextUnitPrice.toFixed()).to.eq(actual.nextUnitPrice.toFixed());
    expect(expected.initialDebtDai.toFixed()).to.eq(actual.initialDebtDai.toFixed());
    expect(expected.liquidationPenaltyRatio.toFixed()).to.eq(actual.liquidationPenaltyRatio.toFixed());
    expect(expected.minimalAuctionedDai.toFixed()).to.eq(actual.minimalAuctionedDai.toFixed());
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
            collateralizationRatio: new BigNumber('3.204790430641710905476031355953603471763531393'),
            proximityToLiquidation: new BigNumber('0.547552318511616565008415094516004867207418444'),
            liquidationPenaltyRatio: new BigNumber('1.13'),
            minimalAuctionedDai: new BigNumber('15000'),

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
            collateralizationRatio: new BigNumber('1.698313241866926788910221380759664664393806833'),
            proximityToLiquidation: new BigNumber('-0.000993196126304112564617120755317536277614422'),
            liquidationPenaltyRatio: new BigNumber('1.13'),
            minimalAuctionedDai: new BigNumber('5000'),

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
        await resetNetwork(21019453);
    });
    const expectedReturn: Record<
        CollateralType,
        { nextUnitPrice: string; currentUnitPrice: string; nextPriceChange: Date }
    > = {
        'AAVE-A': {
            nextUnitPrice: '150.79237464128204',
            currentUnitPrice: '150.79237464128204',
            nextPriceChange: new Date('2024-01-30T01:00:00.000Z'),
        },
        'BAL-A': {
            currentUnitPrice: '11.721140147069267',
            nextUnitPrice: '11.721140147069267',
            nextPriceChange: new Date('2024-01-30T01:00:00.000Z'),
        },
        'BAT-A': {
            nextUnitPrice: '0.73',
            currentUnitPrice: '0.73',
            nextPriceChange: new Date('2024-01-30T01:00:00.000Z'),
        },
        'COMP-A': {
            nextUnitPrice: '124.5640565401381',
            currentUnitPrice: '124.5640565401381',
            nextPriceChange: new Date('2024-01-30T01:00:00.000Z'),
        },
        'ETH-A': {
            nextUnitPrice: '1712.2106886',
            currentUnitPrice: '1712.2106886',
            nextPriceChange: new Date('2022-09-09T10:00:00.000Z'),
        },
        'ETH-B': {
            nextUnitPrice: '2643.19',
            currentUnitPrice: '2643.19',
            nextPriceChange: new Date('2024-10-22T07:00:00.000Z'),
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
            nextUnitPrice: '1.8601360490999999',
            currentUnitPrice: '1.8601360490999999',
            nextPriceChange: new Date('2023-04-06T19:00:00.000Z'),
        },
        'LINK-A': {
            nextUnitPrice: '14.56509',
            currentUnitPrice: '7.2',
            nextPriceChange: new Date('2024-01-30T01:00:00.000Z'),
        },
        'LRC-A': {
            nextUnitPrice: '0.8117493344000001',
            currentUnitPrice: '0.8117493344000001',
            nextPriceChange: new Date('2024-01-30T01:00:00.000Z'),
        },
        'MANA-A': {
            nextUnitPrice: '0.36741132408456323',
            currentUnitPrice: '0.36741132408456323',
            nextPriceChange: new Date('2024-01-30T01:00:00.000Z'),
        },
        'PAXUSD-A': {
            nextUnitPrice: 'NaN',
            currentUnitPrice: '1',
            nextPriceChange: new Date(NaN),
        },
        'RENBTC-A': {
            nextUnitPrice: '66992.455',
            currentUnitPrice: '66992.455',
            nextPriceChange: new Date('2024-10-22T07:00:00.000Z'),
        },
        'TUSD-A': {
            nextUnitPrice: 'NaN',
            currentUnitPrice: '1',
            nextPriceChange: new Date(NaN),
        },
        'UNI-A': {
            nextUnitPrice: '5.845563067104212',
            currentUnitPrice: '5.845563067104212',
            nextPriceChange: new Date('2024-01-30T01:00:00.000Z'),
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
            nextUnitPrice: '1.000413775900346',
            currentUnitPrice: '1.000413775900346',
            nextPriceChange: new Date('2023-04-06T19:00:00.000Z'),
        },
        'WBTC-A': {
            nextUnitPrice: '66992.455',
            currentUnitPrice: '66992.455',
            nextPriceChange: new Date('2024-10-22T07:00:00.000Z'),
        },
        'WBTC-B': {
            nextUnitPrice: '66992.455',
            currentUnitPrice: '66992.455',
            nextPriceChange: new Date('2024-10-22T07:00:00.000Z'),
        },
        'WBTC-C': {
            nextUnitPrice: '66992.455',
            currentUnitPrice: '66992.455',
            nextPriceChange: new Date('2024-10-22T07:00:00.000Z'),
        },
        'YFI-A': {
            nextUnitPrice: '6274.912194791102',
            currentUnitPrice: '6274.912194791102',
            nextPriceChange: new Date('2024-01-30T01:00:00.000Z'),
        },
        'ZRX-A': {
            nextUnitPrice: '0.54008',
            currentUnitPrice: '0.54008',
            nextPriceChange: new Date('2024-01-30T01:00:00.000Z'),
        },
        'MATIC-A': {
            nextUnitPrice: '0.6834569949358978',
            currentUnitPrice: '0.6834569949358978',
            nextPriceChange: new Date('2024-01-30T01:00:00.000Z'),
        },
        'WSTETH-A': {
            nextUnitPrice: '3095.153407214590908078',
            currentUnitPrice: '3095.153407214590908078',
            nextPriceChange: new Date('2024-10-22T07:00:00.000Z'),
        },
        'WSTETH-B': {
            nextUnitPrice: '3095.153407214590908078',
            currentUnitPrice: '3095.153407214590908078',
            nextPriceChange: new Date('2024-10-22T07:00:00.000Z'),
        },
        'CRVV1ETHSTETH-A': {
            nextUnitPrice: '2949.792480904069309162',
            currentUnitPrice: '2898.680178316106908798',
            nextPriceChange: new Date('2024-10-21T16:00:11.000Z'),
        },
        'UNIV2DAIETH-A': {
            nextUnitPrice: '180.027413016904332609',
            currentUnitPrice: '156.864657339046759104',
            nextPriceChange: new Date('2024-01-30T01:43:59.000Z'),
        },
        'UNIV2USDCETH-A': {
            nextUnitPrice: '217940294.382329574841183087',
            currentUnitPrice: '188666866.181749331159918865',
            nextPriceChange: new Date('2024-01-30T01:43:59.000Z'),
        },
        'UNIV2ETHUSDT-A': {
            nextUnitPrice: '197722335.963263628773031269',
            currentUnitPrice: '228116379.650719357480121186',
            nextPriceChange: new Date('2023-04-06T18:44:23.000Z'),
        },
        'UNIV2WBTCDAI-A': {
            nextUnitPrice: '47113092.314935817960683604',
            currentUnitPrice: '37716763.676534507210426868',
            nextPriceChange: new Date('2024-01-30T01:43:59.000Z'),
        },
        'UNIV2WBTCETH-A': {
            nextUnitPrice: '2517374355.748241170169672756',
            currentUnitPrice: '1794044631.240253383841931772',
            nextPriceChange: new Date('2024-01-30T01:43:59.000Z'),
        },
        'UNIV2LINKETH-A': {
            nextUnitPrice: '632.725670378659259608',
            currentUnitPrice: '375.213195603332086751',
            nextPriceChange: new Date('2024-01-30T01:43:59.000Z'),
        },
        'UNIV2UNIETH-A': {
            nextUnitPrice: '546.022046787969721817',
            currentUnitPrice: '478.806858210117892322',
            nextPriceChange: new Date('2024-01-30T01:43:59.000Z'),
        },
        'UNIV2AAVEETH-A': {
            nextUnitPrice: '1435.896796202841677092',
            currentUnitPrice: '2503.767176345875098159',
            nextPriceChange: new Date('2023-04-06T18:44:23.000Z'),
        },
        'UNIV2DAIUSDT-A': {
            nextUnitPrice: '2333803.165539906895807342',
            currentUnitPrice: '2274141.032812901837192665',
            nextPriceChange: new Date('2023-04-06T18:44:23.000Z'),
        },
        'UNIV2DAIUSDC-A': {
            nextUnitPrice: '2265919.675663883138436151',
            currentUnitPrice: '2265919.675663883138436151',
            nextPriceChange: new Date('2024-10-22T06:53:35.000Z'),
        },
        'LSE-MKR-A': {
            nextUnitPrice: '1177.52796',
            currentUnitPrice: '1177.52796',
            nextPriceChange: new Date('2024-10-22T07:00:00.000Z'),
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
        await resetNetwork(21019453); // TODO: remove hardcoded block number and investigate `Dog/not-unsafe` error
    });
    for (const collateralType of getLiquidatableCollateralTypes()) {
        it(`runs the simulaton for ${collateralType}`, async () => {
            await overwriteCurrentOraclePrice(TEST_NETWORK, collateralType, new BigNumber(1000));
            await adjustLimitsAndRates(collateralType);
            const collateralOwned = (await calculateMinCollateralAmountToOpenVault(collateralType)).multipliedBy(10);
            const vaultAddress = (await createVaultWithCollateral(collateralType, collateralOwned)).vaultAddress;
            await warpTime(60 * 24 * 30 * 12 * 2, 60);
            await overwriteCurrentOraclePrice(TEST_NETWORK, collateralType, new BigNumber(500));
            await collectStabilityFees(TEST_NETWORK, collateralType);
            await liquidateVault(TEST_NETWORK, collateralType, vaultAddress);
        });
    }
});

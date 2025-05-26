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
        await resetNetwork(22518357);

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
            nextPriceChange: new Date('2025-05-19T18:00:00.000Z'),

            liquidationRatio: new BigNumber('1.45'),
            collateralizationRatio: new BigNumber('3.119394374327050451814720542969680729781434867'),
            proximityToLiquidation: new BigNumber('0.535166180995370388689502120284703432907797604'),
            liquidationPenaltyRatio: new BigNumber('1.13'),
            minimalAuctionedDai: new BigNumber('7500'),

            incentiveCombinedDai: new BigNumber('32315.96853585008538876687671736803390629848798944710115'),
            incentiveRelativeDai: new BigNumber('32065.96853585008538876687671736803390629848798944710115'),
            incentiveConstantDai: new BigNumber('250'),
            grossProfitDai: new BigNumber('32315.96853585008538876687671736803390629848798944710115'),
            netProfitDai: new BigNumber('34050.658282683546927424640855005903328826'),
            stabilityFeeRate: new BigNumber('1.247428405453575654454846861'),
            minUnitPrice: new BigNumber('1691.947816431034482758620689655'),
            maximumProtocolDebtDai: new BigNumber('150000000'),
            currentProtocolDebtDai: new BigNumber(0),
            currentCollateralDebtDai: new BigNumber(0),
            maximumCollateralDebtDai: new BigNumber(40000000),
            transactionFeeLiquidationEth: new BigNumber('0.000669987000446658'),
            transactionFeeLiquidationDai: new BigNumber('1.130545198449229148108694994096671174'),
            debtDai: new BigNumber('78957678.997723451728972900108270616663609801471554399'),
            collateralAmount: new BigNumber('100394.446946772373610407'),
            currentUnitPrice: new BigNumber('2453.324333825'),
            nextUnitPrice: new BigNumber('2472.675'),
            initialDebtDai: new BigNumber('63296361.260118782725493659'),
        };
        compareVaultTransactionsNotLiquidated(expectedObject, vaultTransactionLiquidatable);
    });
    it('Fetches liquidated vault', async () => {
        await resetNetwork(22518357);
        const vault = await fetchVault(TEST_NETWORK, 7370);
        const vaultTransaction = (await getVaultTransaction(TEST_NETWORK, vault)) as VaultTransactionLiquidated;
        expect(vaultTransaction.state).to.eq('liquidated');
        expect(vaultTransaction.pastLiquidations[0].auctionId).to.eq('ETH-A:860');
        expect(vaultTransaction.pastLiquidations[0].transactionHash).to.eq(
            '0xf8345ac015aa0d6e7c98fe7d3e08bd3eb2ba8cab116efa1173194d2c5bddffb7'
        );
        expect(vaultTransaction.pastLiquidations[0].liquidationDate.toISOString()).to.eq('2024-08-05T02:00:11.000Z');
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
            maximumProtocolDebtDai: new BigNumber('150000000'),
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
        await resetNetwork(22518357);
    });
    const expectedReturn: Record<
        CollateralType,
        { nextUnitPrice: string; currentUnitPrice: string; nextPriceChange: Date }
    > = {
        'ETH-A': {
            nextUnitPrice: '2472.675',
            currentUnitPrice: '2453.324333825',
            nextPriceChange: new Date('2025-05-19T18:00:00.000Z'),
        },
        'ETH-B': {
            nextUnitPrice: '2472.675',
            currentUnitPrice: '2453.324333825',
            nextPriceChange: new Date('2025-05-19T18:00:00.000Z'),
        },
        'ETH-C': {
            nextUnitPrice: '1208.0159951',
            currentUnitPrice: '1227.067888375',
            nextPriceChange: new Date('2022-06-13T11:00:00.000Z'),
        },
        'WBTC-A': {
            nextUnitPrice: '104984.67',
            currentUnitPrice: '104247.995',
            nextPriceChange: new Date('2025-05-19T18:00:00.000Z'),
        },
        'WBTC-B': {
            nextUnitPrice: '104984.67',
            currentUnitPrice: '104247.995',
            nextPriceChange: new Date('2025-05-19T18:00:00.000Z'),
        },
        'WBTC-C': {
            nextUnitPrice: '104984.67',
            currentUnitPrice: '104247.995',
            nextPriceChange: new Date('2025-05-19T18:00:00.000Z'),
        },
        'WSTETH-A': {
            nextUnitPrice: '3000.874746327222097081',
            currentUnitPrice: '2949.13312498745934791',
            nextPriceChange: new Date('2025-05-19T18:00:00.000Z'),
        },
        'WSTETH-B': {
            nextUnitPrice: '3000.874746327222097081',
            currentUnitPrice: '2949.13312498745934791',
            nextPriceChange: new Date('2025-05-19T18:00:00.000Z'),
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
            nextUnitPrice: '2268266.41366025603013961',
            currentUnitPrice: '2268266.41366025603013961',
            nextPriceChange: new Date('2025-05-19T17:49:11.000Z'),
        },
        'LSE-MKR-A': {
            nextUnitPrice: '1708.675',
            currentUnitPrice: '1692.1',
            nextPriceChange: new Date('2025-05-19T18:00:00.000Z'),
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
        await resetNetwork(22518357); // TODO: remove hardcoded block number and investigate `Dog/not-unsafe` error
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

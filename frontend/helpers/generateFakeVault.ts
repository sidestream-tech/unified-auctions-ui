import {
    LiquidationLimits,
    OraclePrices,
    Vault,
    VaultAmount,
    VaultBase,
    VaultTransaction,
    VaultTransactionFees,
    VaultTransactionLiquidated,
    VaultTransactionNotLiquidated,
    VaultTransactionState,
    VaultCollateralParameters,
} from 'auctions-core/src/types';
import faker from 'faker';
import COLLATERALS from 'auctions-core/src/constants/COLLATERALS';
import BigNumber from 'bignumber.js';
import { random } from 'lodash';

const generateFakeVaultBase = function (): VaultBase {
    const address = faker.finance.ethereumAddress();
    const collateralType = faker.helpers.randomize(Object.keys(COLLATERALS));
    const network = 'mainnet';
    return {
        address,
        collateralType,
        network,
    };
};

const generateFakeVaultAmount = function (): VaultAmount {
    const initialDebtDai = new BigNumber(faker.finance.amount());
    const collateralAmount = new BigNumber(faker.finance.amount());

    return {
        initialDebtDai,
        collateralAmount,
    };
};

export const generateFakeLiquidationLimits = function (): LiquidationLimits {
    const maximumProtocolDebtDai = new BigNumber(faker.finance.amount());
    const currentProtocolDebtDai = maximumProtocolDebtDai.dividedBy(faker.datatype.number({ min: 1, max: 5 }));
    const maximumCollateralDebtDai = new BigNumber(faker.finance.amount());
    const currentCollateralDebtDai = maximumCollateralDebtDai.dividedBy(faker.datatype.number({ min: 1, max: 5 }));
    const liquidationPenaltyRatio = new BigNumber(faker.datatype.float({ min: 1.1, max: 1.5 }));
    const minimalAuctionedDai = new BigNumber(faker.finance.amount());

    return {
        maximumProtocolDebtDai,
        currentProtocolDebtDai,
        maximumCollateralDebtDai,
        currentCollateralDebtDai,
        liquidationPenaltyRatio,
        minimalAuctionedDai,
    };
};

export const generateFakeVaultCollateralParameters = (): VaultCollateralParameters => {
    const stabilityFeeRate = new BigNumber(faker.datatype.float({ max: 1.5 }));
    const minUnitPrice = new BigNumber(faker.finance.amount());
    return {
        stabilityFeeRate,
        minUnitPrice,
    };
};

export const generateFakeVault = function (): Vault {
    const vaultBase = generateFakeVaultBase();
    const vaultAmount = generateFakeVaultAmount();
    const liquidationLimits = generateFakeLiquidationLimits();
    const vaultCollateralParameters = generateFakeVaultCollateralParameters();
    const lastSyncedAt = faker.date.recent();

    return {
        lastSyncedAt,
        ...vaultBase,
        ...vaultAmount,
        ...liquidationLimits,
        ...vaultCollateralParameters,
    };
};

const generateFakeVaultTransactionFees = function (): VaultTransactionFees {
    const transactionFeeLiquidationEth = new BigNumber(faker.datatype.float({ max: 0.5 }));
    const transactionFeeLiquidationDai = transactionFeeLiquidationEth.multipliedBy(1600);

    return {
        transactionFeeLiquidationEth,
        transactionFeeLiquidationDai,
    };
};

const generateFakeOraclePrices = function (): OraclePrices {
    const currentUnitPrice = new BigNumber(faker.datatype.number(2));
    const nextUnitPrice = currentUnitPrice.multipliedBy(1.25);
    const nextPriceChange = faker.date.soon();

    return {
        currentUnitPrice,
        nextPriceChange,
        nextUnitPrice,
    };
};

export const generateFakeVaultLiquidatedTransaction = function (): VaultTransactionLiquidated {
    const fakeVault = generateFakeVault();

    const liquidationDate = faker.date.recent();
    const transactionHash = faker.finance.ethereumAddress();
    const auctionId = `${fakeVault.collateralType}:${faker.datatype.number()}`;

    return {
        ...fakeVault,
        state: 'liquidated',
        pastLiquidations: [{ liquidationDate, transactionHash, auctionId }],
    };
};

export const generateFakeVaultNotLiquidatedTransaction = function (): VaultTransactionNotLiquidated {
    const fakeVault = generateFakeVault();
    const fakeTransactionFees = generateFakeVaultTransactionFees();
    const fakeOraclePrices = generateFakeOraclePrices();

    const liquidationRatio = new BigNumber(faker.datatype.number({ min: 110, max: 150 }));
    const minUnitPrice = faker.datatype.number();
    const collateralizationRatio = fakeVault.collateralAmount.multipliedBy(minUnitPrice);
    const debtDai = new BigNumber(faker.finance.amount());
    const proximityToLiquidation = liquidationRatio
        .minus(collateralizationRatio)
        .multipliedBy(debtDai)
        .dividedBy(liquidationRatio);

    const state: VaultTransactionState = proximityToLiquidation.isLessThanOrEqualTo(0)
        ? 'liquidatable'
        : 'not-liquidatable';

    const incentiveRelativeDai = new BigNumber(faker.finance.amount());
    const incentiveConstantDai = new BigNumber(faker.finance.amount());
    const incentiveCombinedDai = incentiveRelativeDai.plus(incentiveConstantDai);

    const netProfitDai = incentiveCombinedDai.minus(fakeTransactionFees.transactionFeeLiquidationDai);

    return {
        ...fakeVault,
        ...fakeTransactionFees,
        ...fakeOraclePrices,
        liquidationRatio,
        collateralizationRatio,
        proximityToLiquidation,
        state,
        incentiveRelativeDai,
        incentiveConstantDai,
        incentiveCombinedDai,
        grossProfitDai: incentiveCombinedDai,
        netProfitDai,
        debtDai,
    };
};

export const generateFakeVaults = function (number = random(5, 15)) {
    return Array(number).fill(null).map(generateFakeVault);
};

export const generateFakeVaultTransactions = function (
    liquidatedVaultsAmount = random(1, 5),
    notLiquidatedVaultsAmount = random(5, 15)
) {
    const vaults: VaultTransaction[] = [
        ...Array(liquidatedVaultsAmount).fill(null).map(generateFakeVaultLiquidatedTransaction),
        ...Array(notLiquidatedVaultsAmount).fill(null).map(generateFakeVaultNotLiquidatedTransaction),
    ];
    return faker.helpers.shuffle(vaults);
};

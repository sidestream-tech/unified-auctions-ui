import {
    LiquidationLimits,
    OraclePrices,
    Vault,
    VaultAmount,
    VaultBase,
    VaultTransactionFees,
    VaultTransactionLiquidated,
    VaultTransactionNotLiquidated,
    VaultTransactionState,
} from 'auctions-core/src/types';
import faker from 'faker';
import COLLATERALS from 'auctions-core/src/constants/COLLATERALS';
import BigNumber from 'bignumber.js';
import { random } from 'lodash';

const generateFakeVaultBase = function (): VaultBase {
    const id = faker.datatype.number();
    const address = faker.finance.ethereumAddress();
    const collateralType = faker.helpers.randomize(Object.keys(COLLATERALS));
    const network = 'mainnet';
    const lastSyncedAt = faker.date.recent();

    return {
        id,
        address,
        collateralType,
        network,
        lastSyncedAt,
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

const generateFakerLiquidationLimits = function (): LiquidationLimits {
    const maximumProtocolDebtDai = new BigNumber(faker.finance.amount());
    const currentProtocolDebtDai = maximumProtocolDebtDai.dividedBy(faker.datatype.number({ min: 1, max: 5 }));
    const maximumCollateralDebtDai = new BigNumber(faker.finance.amount());
    const currentCollateralDebtDai = maximumCollateralDebtDai.dividedBy(faker.datatype.number({ min: 1, max: 5 }));

    return {
        maximumProtocolDebtDai,
        currentProtocolDebtDai,
        maximumCollateralDebtDai,
        currentCollateralDebtDai,
    };
};

export const generateFakeVault = function (): Vault {
    const vaultBase = generateFakeVaultBase();
    const vaultAmount = generateFakeVaultAmount();
    const liquidationLimits = generateFakerLiquidationLimits();

    return {
        ...vaultBase,
        ...vaultAmount,
        ...liquidationLimits,
    };
};

const generateFakeVaultTransactionFees = function (): VaultTransactionFees {
    const transactionFeeLiquidationEth = new BigNumber(faker.datatype.number(0.5));
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

const generateFakeVaultLiqudatedTransaction = function (): VaultTransactionLiquidated {
    const fakeVault = generateFakeVault();

    const liqudiationDate = faker.date.recent();
    const transactionHash = faker.finance.ethereumAddress();
    const auctionId = `${fakeVault.collateralType}:${faker.datatype.number()}`;

    return {
        ...fakeVault,
        state: 'liquidated',
        liqudiationDate,
        transactionHash,
        auctionId,
    };
};

export const generateFakeVaultNotLiquidatedTransaction = function (): VaultTransactionNotLiquidated {
    const fakeVault = generateFakeVault();
    const fakeTransactionFees = generateFakeVaultTransactionFees();
    const fakeOraclePrices = generateFakeOraclePrices();

    const liquidationRatio = faker.datatype.number({ min: 110, max: 150 });
    const minUnitPrice = faker.datatype.number();
    const collateralizationRatio = fakeVault.collateralAmount.multipliedBy(minUnitPrice).toNumber();
    const proximityToLiquidation = liquidationRatio - collateralizationRatio;

    const state: VaultTransactionState = proximityToLiquidation < 0 ? 'liquidatable' : 'not-liquidatable';

    const incentiveRelativeDai = new BigNumber(faker.finance.amount());
    const incentiveConstantDai = new BigNumber(faker.finance.amount());
    const incentiveCombinedDai = incentiveRelativeDai.plus(incentiveConstantDai);

    const grossProfitDai = incentiveCombinedDai.minus(fakeTransactionFees.transactionFeeLiquidationDai);
    const debtDai = new BigNumber(faker.finance.amount());

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
        grossProfitDai,
        netProfitDai: incentiveCombinedDai,
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
    const vaults = [];
    vaults.push(Array(liquidatedVaultsAmount).fill(null).map(generateFakeVaultLiqudatedTransaction));
    vaults.push(Array(notLiquidatedVaultsAmount).fill(null).map(generateFakeVaultNotLiquidatedTransaction));
    return vaults;
};

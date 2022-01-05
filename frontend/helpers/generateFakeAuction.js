import faker from 'faker';
import { random } from 'lodash';
import BigNumber from 'bignumber.js';
import COLLATERALS from 'auctions-core/src/constants/COLLATERALS';

export const generateFakeAuction = function () {
    const auctionId = faker.datatype.number();
    const amountRAW = new BigNumber(parseFloat(faker.finance.amount()));
    const amountDAI = new BigNumber(parseFloat(faker.finance.amount()));
    const debtDAI = amountDAI.multipliedBy(faker.datatype.number({ min: 0.1, max: 0.5, precision: 0.001 }));
    const isActive = faker.datatype.boolean();
    const isFinished = faker.datatype.boolean();
    const amountPerCollateral = amountDAI.dividedBy(amountRAW);
    const marketValue = isActive
        ? new BigNumber(faker.datatype.number({ min: -0.3, max: 0.3, precision: 0.001 }))
        : undefined;
    const collateralObject = faker.helpers.randomize(Object.values(COLLATERALS));
    const marketPricePerCollateral = amountPerCollateral.multipliedBy(1 - marketValue);
    const transactionProfit = marketPricePerCollateral
        .multipliedBy(amountRAW)
        .minus(amountPerCollateral.multipliedBy(amountRAW));
    return {
        network: 'stub',
        id: `${collateralObject.ilk}:${auctionId}`,
        auctionId,
        collateralType: collateralObject.ilk,
        collateralSymbol: collateralObject.symbol,
        amountRAW,
        amountDAI,
        debtDAI,
        initialPrice: amountPerCollateral,
        till: faker.date.future().toString(),
        marketValue,
        vaultOwner: faker.finance.ethereumAddress(),
        amountPerCollateral,
        fetchedAmountPerCollateral: amountPerCollateral,
        marketPricePerCollateral,
        isActive,
        transactionProfit,
        isFinished,
        start: faker.date.recent(),
        isRestarting: false,
        transactionAddress: undefined,
        step: new BigNumber(faker.datatype.number(120)),
        cut: new BigNumber(faker.datatype.number({ min: 0.5, max: 1, precision: 0.0001 })),
    };
};

export const generateFakeAuctionTransaction = function () {
    const auction = generateFakeAuction();
    const biddingTransactionFeeETH = faker.datatype.float({ min: 0, max: 0.001, precision: 0.000001 });
    const biddingTransactionFeeDAI = biddingTransactionFeeETH * 1000;
    const authTransactionFeeETH = faker.datatype.float({ min: 0, max: 0.001, precision: 0.000001 });
    const authTransactionFeeDAI = authTransactionFeeETH * 1000;
    const restartTransactionFeeETH = faker.datatype.float({ min: 0, max: 0.001, precision: 0.000001 });
    const transactionOutcome = auction.transactionProfit - biddingTransactionFeeDAI;
    return {
        ...auction,
        biddingTransactionFeeETH,
        biddingTransactionFeeDAI,
        authTransactionFeeETH,
        authTransactionFeeDAI,
        restartTransactionFeeETH,
        transactionOutcome,
    };
};

export const generateFakeAuctionTransactions = function (number = random(5, 15)) {
    return Array(number).fill(null).map(generateFakeAuctionTransaction);
};

export const generateFakeAuctions = function (number = random(5, 15)) {
    return Array(number).fill(null).map(generateFakeAuction);
};

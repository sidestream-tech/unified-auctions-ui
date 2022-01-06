import faker from 'faker';
import { random } from 'lodash';
import BigNumber from 'bignumber.js';
import COLLATERALS from 'auctions-core/src/constants/COLLATERALS';

export const generateFakeAuction = function () {
    const auctionId = faker.datatype.number();
    const collateralAmount = new BigNumber(parseFloat(faker.finance.amount()));
    const totalPrice = new BigNumber(parseFloat(faker.finance.amount()));
    const debtDAI = totalPrice.multipliedBy(faker.datatype.number({ min: 0.1, max: 0.5, precision: 0.001 }));
    const isActive = faker.datatype.boolean();
    const isFinished = faker.datatype.boolean();
    const approximateUnitPrice = totalPrice.dividedBy(collateralAmount);
    const marketUnitPriceToUnitPriceRatio = isActive
        ? new BigNumber(faker.datatype.number({ min: -0.3, max: 0.3, precision: 0.001 }))
        : undefined;
    const collateralObject = faker.helpers.randomize(Object.values(COLLATERALS));
    const marketUnitPrice = approximateUnitPrice.multipliedBy(1 - marketUnitPriceToUnitPriceRatio);
    const transactionProfit = marketUnitPrice
        .multipliedBy(collateralAmount)
        .minus(approximateUnitPrice.multipliedBy(collateralAmount));
    return {
        network: 'stub',
        id: `${collateralObject.ilk}:${auctionId}`,
        auctionId,
        collateralType: collateralObject.ilk,
        collateralSymbol: collateralObject.symbol,
        collateralAmount,
        totalPrice,
        debtDAI,
        initialPrice: approximateUnitPrice,
        endDate: faker.date.future(),
        marketUnitPriceToUnitPriceRatio,
        vaultAddress: faker.finance.ethereumAddress(),
        approximateUnitPrice,
        unitPrice: approximateUnitPrice,
        marketUnitPrice,
        isActive,
        transactionProfit,
        isFinished,
        startDate: faker.date.recent(),
        isRestarting: false,
        transactionAddress: undefined,
        secondsBetweenPriceDrops: faker.datatype.number(120),
        priceDropRatio: new BigNumber(faker.datatype.number({ min: 0.5, max: 1, precision: 0.0001 })),
    };
};

export const generateFakeAuctionTransaction = function () {
    const auction = generateFakeAuction();
    const biddingTransactionFeeETH = faker.datatype.float({ min: 0, max: 0.001, precision: 0.000001 });
    const biddingTransactionFeeDAI = biddingTransactionFeeETH * 1000;
    const authTransactionFeeETH = faker.datatype.float({ min: 0, max: 0.001, precision: 0.000001 });
    const authTransactionFeeDAI = authTransactionFeeETH * 1000;
    const restartTransactionFeeETH = faker.datatype.float({ min: 0, max: 0.001, precision: 0.000001 });
    const transactionProfitMinusFees = auction.transactionProfit - biddingTransactionFeeDAI;
    return {
        ...auction,
        biddingTransactionFeeETH,
        biddingTransactionFeeDAI,
        authTransactionFeeETH,
        authTransactionFeeDAI,
        restartTransactionFeeETH,
        transactionProfitMinusFees,
    };
};

export const generateFakeAuctionTransactions = function (number = random(5, 15)) {
    return Array(number).fill(null).map(generateFakeAuctionTransaction);
};

export const generateFakeAuctions = function (number = random(5, 15)) {
    return Array(number).fill(null).map(generateFakeAuction);
};

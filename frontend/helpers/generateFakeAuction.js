import faker from 'faker';
import { random } from 'lodash';
import BigNumber from 'bignumber.js';
import COLLATERALS from 'auctions-core/src/constants/COLLATERALS';

export const generateFakeAuction = function () {
    const index = faker.datatype.number();
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
    const transactionGrossProfit = marketUnitPrice
        .multipliedBy(collateralAmount)
        .minus(approximateUnitPrice.multipliedBy(collateralAmount));
    const secondsBetweenPriceDrops = faker.datatype.number(120);
    const secondsTillNextPriceDrop = faker.datatype.number(secondsBetweenPriceDrops);
    return {
        network: 'stub',
        id: `${collateralObject.ilk}:${index}`,
        index,
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
        transactionGrossProfit,
        isFinished,
        startDate: faker.date.recent(),
        isRestarting: false,
        transactionAddress: undefined,
        secondsBetweenPriceDrops,
        secondsTillNextPriceDrop,
        minimumBidDai: new BigNumber(faker.finance.amount()),
        priceDropRatio: new BigNumber(faker.datatype.number({ min: 0.5, max: 1, precision: 0.0001 })),
        transactionGrossProfitDate: faker.date.future(),
        fetched: new Date(),
    };
};

export const generateFakeAuctionTransaction = function () {
    const auction = generateFakeAuction();
    const biddingTransactionFeeETH = new BigNumber(faker.datatype.float({ min: 0, max: 0.001, precision: 0.000001 }));
    const biddingTransactionFeeDAI = biddingTransactionFeeETH.multipliedBy(1000);
    const authTransactionFeeETH = new BigNumber(faker.datatype.float({ min: 0, max: 0.001, precision: 0.000001 }));
    const authTransactionFeeDAI = authTransactionFeeETH.multipliedBy(1000);
    const restartTransactionFeeETH = new BigNumber(faker.datatype.float({ min: 0, max: 0.001, precision: 0.000001 }));
    const transactionNetProfit = auction.transactionGrossProfit.minus(biddingTransactionFeeDAI);
    const totalFeeETH = biddingTransactionFeeETH.plus(authTransactionFeeETH);
    const totalFeeDAI = totalFeeETH.multipliedBy(1000);
    return {
        ...auction,
        biddingTransactionFeeETH,
        biddingTransactionFeeDAI,
        authTransactionFeeETH,
        authTransactionFeeDAI,
        restartTransactionFeeETH,
        transactionNetProfit,
        totalFeeETH,
        totalFeeDAI,
    };
};

export const generateFakeAuctionTransactions = function (number = random(5, 15)) {
    return Array(number).fill(null).map(generateFakeAuctionTransaction);
};

export const generateFakeAuctions = function (number = random(5, 15)) {
    return Array(number).fill(null).map(generateFakeAuction);
};

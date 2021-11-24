import faker from 'faker';
import { random } from 'lodash';
import COLLATERALS from '~/lib/constants/COLLATERALS';

export const generateFakeAuction = function () {
    const amountRAW = parseFloat(faker.finance.amount());
    const amountDAI = parseFloat(faker.finance.amount());
    const isActive = faker.datatype.boolean();
    const isFinished = faker.datatype.boolean();
    const amountPerCollateral = amountDAI / amountRAW;
    const marketValue = isActive ? faker.datatype.number({ min: -0.3, max: 0.3, precision: 0.001 }) : undefined;
    const collateralObject = faker.helpers.randomize(Object.values(COLLATERALS));
    const auctionId = faker.datatype.number();
    const marketPricePerCollateral = amountPerCollateral * (1 - marketValue);
    const transactionProfit = marketPricePerCollateral * amountRAW - amountPerCollateral * amountRAW;
    return {
        id: `${collateralObject.ilk}:${auctionId}`,
        auctionId,
        collateralType: collateralObject.ilk,
        collateralSymbol: collateralObject.symbol,
        amountRAW,
        amountDAI,
        till: faker.date.future().toString(),
        marketValue,
        vaultOwner: faker.finance.ethereumAddress(),
        amountPerCollateral,
        marketPricePerCollateral,
        isActive,
        transactionProfit,
        isFinished,
        start: faker.date.recent(),
        isRestarting: false,
        transactionAddress: undefined,
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
    const auctionTransactions = Array(number).fill(null).map(generateFakeAuctionTransaction);
    return auctionTransactions;
};

export const generateFakeAuctions = function (number = random(5, 15)) {
    const auctions = Array(number).fill(null).map(generateFakeAuction);
    return auctions;
};

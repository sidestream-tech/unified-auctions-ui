import faker from 'faker';
import { random } from 'lodash';
import COLLATERALS from '~/lib/constants/COLLATERALS';

export const generateFakeAuction = function () {
    const amountRAW = parseFloat(faker.finance.amount());
    const amountDAI = parseFloat(faker.finance.amount());
    const isActive = faker.datatype.boolean();
    const marketValue = isActive ? faker.datatype.number({ min: -0.05, max: 0.05, precision: 0.001 }) : undefined;
    const amountPerCollateral = amountDAI / amountRAW;
    const collateralObject = faker.helpers.randomize(Object.values(COLLATERALS));
    const auctionId = faker.datatype.number();

    return {
        id: `${collateralObject.ilk}:${auctionId}`,
        auctionId,
        collateralType: collateralObject.ilk,
        collateralSymbol: collateralObject.symbol,
        amountRAW,
        amountDAI,
        till: faker.date.future().toString(),
        marketValue,
        marketPricePerCollateral: amountPerCollateral * (marketValue + 1),
        vaultOwner: faker.finance.ethereumAddress(),
        amountPerCollateral,
        isActive,
        transactionAddress: undefined,
    };
};

export const generateFakeAuctionTransaction = function () {
    const fakeAuction = generateFakeAuction();
    const transactionProfit = fakeAuction.marketValue * fakeAuction.amountDAI;
    const biddingTransactionFeeETH = faker.datatype.float({ min: 0, max: 0.001, precision: 0.000001 });
    const biddingTransactionFeeDAI = biddingTransactionFeeETH * 1000;
    const authTransactionFeeETH = faker.datatype.float({ min: 0, max: 0.001, precision: 0.000001 });
    const authTransactionFeeDAI = authTransactionFeeETH * 1000;
    const restartTransactionFeeETH = faker.datatype.float({ min: 0, max: 0.001, precision: 0.000001 });
    const transactionOutcome = transactionProfit - biddingTransactionFeeDAI;
    return {
        ...fakeAuction,
        biddingTransactionFeeETH,
        biddingTransactionFeeDAI,
        authTransactionFeeETH,
        authTransactionFeeDAI,
        restartTransactionFeeETH,
        transactionProfit,
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

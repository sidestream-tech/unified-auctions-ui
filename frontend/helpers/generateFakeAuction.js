import faker from 'faker';
import { random } from 'lodash';
import COLLATERALS from '~/lib/constants/COLLATERALS';

export const generateFakeAuction = function () {
    const amountRAW = parseFloat(faker.finance.amount());
    const amountDAI = parseFloat(faker.finance.amount());
    const isActive = faker.datatype.boolean();
    const marketValue = isActive ? faker.datatype.number({ min: -0.05, max: 0.05, precision: 0.001 }) : undefined;
    const amountPerCollateral = amountDAI / amountRAW;

    return {
        id: faker.datatype.number().toString(),
        collateralType: faker.helpers.randomize(Object.values(COLLATERALS).map(c => c.title)),
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
    const transactionFeeETH = faker.datatype.float({ min: 0, max: 0.001, precision: 0.000001 });
    const transactionProfit = fakeAuction.marketValue * fakeAuction.amountDAI;
    const transactionFeeDAI = transactionFeeETH * 1000;
    const transactionOutcome = transactionProfit - transactionFeeDAI;
    return {
        ...fakeAuction,
        transactionFeeETH,
        transactionProfit,
        transactionFeeDAI,
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

import faker from 'faker';

export const generateFakeAuction = function () {
    const amountRAW = parseFloat(faker.finance.amount());
    const amountDAI = parseFloat(faker.finance.amount());
    return {
        id: faker.datatype.number().toString(),
        collateralType: faker.finance.currencyCode(),
        amountRAW: parseFloat(faker.finance.amount()),
        amountDAI: parseFloat(faker.finance.amount()),
        till: faker.date.future(),
        marketValue: faker.datatype.number({ min: -1, max: 1, precision: 0.001 }),
        vaultOwner: faker.finance.ethereumAddress(),
        amountPerCollateral: amountDAI / amountRAW,
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

export const generateFakeAuctionTransactions = function (number = 1) {
    const auctionTransactions = Array(number).fill(null).map(generateFakeAuctionTransaction);
    return auctionTransactions;
};

export const generateFakeAuctions = function (number = 1) {
    const auctions = Array(number).fill(null).map(generateFakeAuction);
    return auctions;
};

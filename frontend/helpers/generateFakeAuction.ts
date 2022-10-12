import faker from 'faker';
import { random } from 'lodash';
import BigNumber from 'bignumber.js';
import COLLATERALS from 'auctions-core/src/constants/COLLATERALS';
import { AuctionTransaction } from '~/../core/src/types';

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
    const marketUnitPrice = approximateUnitPrice.multipliedBy(
        new BigNumber(1).minus(marketUnitPriceToUnitPriceRatio || 0)
    );
    const suggestedMarketId = 'Uniswap v3';
    const marketData = {
        'Uniswap v3': {
            unitPrice: marketUnitPrice.multipliedBy(
                new BigNumber(faker.datatype.float({ min: 1.1, max: 1.5, precision: 0.001 }))
            ),
            route: [collateralObject.symbol, 'USDC'],
        },
        'Uniswap v2': {
            unitPrice: marketUnitPrice.multipliedBy(
                new BigNumber(faker.datatype.float({ min: 1.1, max: 1.5, precision: 0.001 }))
            ),
            route: [collateralObject.symbol],
        },
    };
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
        marketData,
        suggestedMarketId,
        isActive,
        transactionGrossProfit,
        isFinished,
        startDate: faker.date.recent(),
        isRestarting: false,
        transactionAddress: undefined,
        secondsBetweenPriceDrops,
        secondsTillNextPriceDrop,
        collateralToCoverDebt: collateralAmount.multipliedBy(debtDAI.dividedBy(totalPrice)),
        minimumBidDai: new BigNumber(faker.finance.amount()),
        priceDropRatio: new BigNumber(faker.datatype.number({ min: 0.5, max: 1, precision: 0.0001 })),
        transactionGrossProfitDate: faker.date.future(),
        fetchedAt: new Date(),
    };
};

export const generateFakeAuctionTransaction = function (): AuctionTransaction {
    const auction = generateFakeAuction();
    const swapTransactionFeeETH = new BigNumber(faker.datatype.float({ min: 0, max: 0.001, precision: 0.000001 }));
    const swapTransactionFeeDAI = swapTransactionFeeETH.multipliedBy(1000);
    const bidTransactionFeeETH = new BigNumber(faker.datatype.float({ min: 0, max: 0.001, precision: 0.000001 }));
    const bidTransactionFeeDAI = bidTransactionFeeETH.multipliedBy(1000);
    const authTransactionFeeETH = new BigNumber(faker.datatype.float({ min: 0, max: 0.001, precision: 0.000001 }));
    const authTransactionFeeDAI = authTransactionFeeETH.multipliedBy(1000);
    const restartTransactionFeeETH = new BigNumber(faker.datatype.float({ min: 0, max: 0.001, precision: 0.000001 }));
    const restartTransactionFeeDAI = restartTransactionFeeETH.multipliedBy(1000);
    const transactionNetProfit = auction.transactionGrossProfit.minus(swapTransactionFeeDAI);
    const combinedSwapFeesETH = swapTransactionFeeETH.plus(authTransactionFeeETH).plus(authTransactionFeeETH);
    const combinedSwapFeesDAI = combinedSwapFeesETH.multipliedBy(1000);
    const combinedBidFeesETH = bidTransactionFeeETH.plus(authTransactionFeeETH).plus(authTransactionFeeETH);
    const combinedBidFeesDAI = combinedBidFeesETH.multipliedBy(1000);
    return {
        ...auction,
        swapTransactionFeeETH,
        swapTransactionFeeDAI,
        bidTransactionFeeETH,
        bidTransactionFeeDAI,
        authTransactionFeeETH,
        authTransactionFeeDAI,
        restartTransactionFeeETH,
        restartTransactionFeeDAI,
        transactionNetProfit,
        combinedSwapFeesETH,
        combinedSwapFeesDAI,
        combinedBidFeesETH,
        combinedBidFeesDAI,
    };
};

export const generateFakeAuctionTransactions = function (number = random(5, 15)) {
    return Array(number).fill(null).map(generateFakeAuctionTransaction);
};

export const generateFakeAuctions = function (number = random(5, 15)) {
    return Array(number).fill(null).map(generateFakeAuction);
};

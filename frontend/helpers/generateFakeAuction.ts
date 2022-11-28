import faker from 'faker';
import { random } from 'lodash';
import BigNumber from 'bignumber.js';
import COLLATERALS from 'auctions-core/src/constants/COLLATERALS';
import { AuctionTransaction, MarketData } from '~/../core/src/types';
import { routeToPool } from '~/../core/src/calleeFunctions/helpers/pools';

const FAKE_CALLEES = ['Uniswap V3', '1inch']; // Curve V3 marketUnitPrice is NaN (see below)

export const generateFakeMarketData = function (
    isActive: boolean,
    approximateUnitPrice: BigNumber,
    collateralAmount: BigNumber
) {
    const marketUnitPriceToUnitPriceRatio = isActive
        ? new BigNumber(faker.datatype.number({ min: -0.3, max: 0.3, precision: 0.001 }))
        : undefined;
    const marketUnitPrice = approximateUnitPrice.multipliedBy(
        new BigNumber(1).minus(marketUnitPriceToUnitPriceRatio || 0)
    );
    const transactionGrossProfit = marketUnitPrice
        .multipliedBy(collateralAmount)
        .minus(approximateUnitPrice.multipliedBy(collateralAmount));
    const transactionGrossProfitDate = faker.date.future();
    return {
        marketUnitPrice,
        marketUnitPriceToUnitPriceRatio,
        transactionGrossProfit,
        transactionGrossProfitDate,
    };
};

export const generateFakeAuction = async function () {
    const index = faker.datatype.number();
    const collateralAmount = new BigNumber(parseFloat(faker.finance.amount()));
    const totalPrice = new BigNumber(parseFloat(faker.finance.amount()));
    const debtDAI = totalPrice.multipliedBy(faker.datatype.number({ min: 0.1, max: 0.5, precision: 0.001 }));
    const isActive = faker.datatype.boolean();
    const isFinished = faker.datatype.boolean();
    const approximateUnitPrice = totalPrice.dividedBy(collateralAmount);
    const collateralObject = faker.helpers.randomize(Object.values(COLLATERALS));
    const suggestedMarketId = faker.helpers.randomize(FAKE_CALLEES);
    const marketDataRecords: Record<string, MarketData> = {
        'Uniswap V3': {
            ...generateFakeMarketData(isActive, approximateUnitPrice, collateralAmount),
            pools: await routeToPool('custom', [collateralObject.symbol, 'USDC'], 3000),
        },
        'Curve V3': {
            marketUnitPrice: new BigNumber(NaN),
            pools: await routeToPool('custom', [collateralObject.symbol], 3000),
        },
        '1inch': {
            ...generateFakeMarketData(isActive, approximateUnitPrice, collateralAmount),
            pools: await routeToPool('custom', [collateralObject.symbol], 3000),
        },
    };
    const marketUnitPriceToUnitPriceRatio = marketDataRecords[suggestedMarketId].marketUnitPriceToUnitPriceRatio;
    const marketUnitPrice = marketDataRecords[suggestedMarketId].marketUnitPrice;
    const transactionGrossProfit = marketDataRecords[suggestedMarketId].transactionGrossProfit;
    const transactionGrossProfitDate = marketDataRecords[suggestedMarketId].transactionGrossProfitDate;
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
        marketDataRecords,
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
        transactionGrossProfitDate,
        fetchedAt: new Date(),
    };
};

export const generateFakeAuctionTransaction = async function (): Promise<AuctionTransaction> {
    const auction = await generateFakeAuction();
    const swapTransactionFeeETH = new BigNumber(faker.datatype.float({ min: 0, max: 0.001, precision: 0.000001 }));
    const swapTransactionFeeDAI = swapTransactionFeeETH.multipliedBy(1000);
    const bidTransactionFeeETH = new BigNumber(faker.datatype.float({ min: 0, max: 0.001, precision: 0.000001 }));
    const bidTransactionFeeDAI = bidTransactionFeeETH.multipliedBy(1000);
    const authTransactionFeeETH = new BigNumber(faker.datatype.float({ min: 0, max: 0.001, precision: 0.000001 }));
    const authTransactionFeeDAI = authTransactionFeeETH.multipliedBy(1000);
    const restartTransactionFeeETH = new BigNumber(faker.datatype.float({ min: 0, max: 0.001, precision: 0.000001 }));
    const restartTransactionFeeDAI = restartTransactionFeeETH.multipliedBy(1000);
    for (const marketData of Object.values(auction.marketDataRecords)) {
        if (marketData.transactionGrossProfit) {
            marketData.transactionNetProfit = marketData.transactionGrossProfit.minus(swapTransactionFeeDAI);
        }
    }
    const transactionNetProfit =
        auction.marketDataRecords[auction.suggestedMarketId].transactionNetProfit || new BigNumber(NaN);
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

export const generateFakeAuctions = async function (number = random(5, 15)) {
    return await Promise.all(Array(number).fill(null).map(generateFakeAuction));
};

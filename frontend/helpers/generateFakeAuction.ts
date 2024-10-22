import faker from 'faker';
import { random } from 'lodash';
import BigNumber from 'bignumber.js';
import COLLATERALS from 'auctions-core/src/constants/COLLATERALS';
import { AuctionTransaction, MarketData } from '~/../core/src/types';

export const generateFakeMarketData = function (
    isActive: boolean,
    approximateUnitPrice: BigNumber,
    collateralAmount: BigNumber,
    isRatioPositive: boolean
) {
    const marketUnitPriceToUnitPriceRatio = isActive
        ? new BigNumber(
              faker.datatype.number({
                  min: isRatioPositive ? 0 : -0.3,
                  max: isRatioPositive ? 0.3 : 0,
                  precision: 0.001,
              })
          )
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

const sortMarketDataRecords = function (marketDataRecords: Record<string, MarketData>): [string, MarketData][] {
    const marketDataArraySorted = Object.entries(marketDataRecords || {});
    marketDataArraySorted.sort((a, b) => {
        // push NaNs to the end
        if (a[1].marketUnitPrice.isNaN() && b[1].marketUnitPrice.isNaN()) {
            return 1;
        }
        if (a[1].marketUnitPrice.isNaN()) {
            return 1;
        }
        if (b[1].marketUnitPrice.isNaN()) {
            return -1;
        }
        return b[1].marketUnitPrice.minus(a[1].marketUnitPrice).toNumber();
    });
    return marketDataArraySorted;
};

export const generateFakeAuction = function () {
    const index = faker.datatype.number();
    const collateralAmount = new BigNumber(parseFloat(faker.finance.amount()));
    const totalPrice = new BigNumber(parseFloat(faker.finance.amount()));
    const debtDAI = totalPrice.multipliedBy(faker.datatype.number({ min: 0.1, max: 0.5, precision: 0.001 }));
    const isActive = faker.datatype.boolean();
    const isFinished = faker.datatype.boolean();
    const approximateUnitPrice = totalPrice.dividedBy(collateralAmount);
    const collateralObject = COLLATERALS['ETH-A'];
    const fakePoolsTwoSteps = [
        {
            addresses: ['0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'],
            fee: 3000,
            routes: ['ETH-A', 'USDC-A'],
        },
        {
            addresses: ['0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', '0x6b175474e89094c44da98b954eedeac495271d0f'],
            fee: 3000,
            routes: ['USDC-A', 'DAI'],
        },
    ];
    const fakePoolsNanMarketUnitPrice = [
        {
            addresses: ['0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', '0x6b175474e89094c44da98b954eedeac495271d0f'],
            fee: 3000,
            routes: ['ETH-A', 'DAI'],
        },
    ];
    const fakePoolsOneStep = [
        {
            addresses: ['0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', '0x6b175474e89094c44da98b954eedeac495271d0f'],
            fee: 3000,
            routes: ['ETH-A', 'DAI'],
        },
    ];

    const marketDataRecords: Record<string, MarketData> = {
        'Uniswap V3': {
            ...generateFakeMarketData(isActive, approximateUnitPrice, collateralAmount, true),
            pools: fakePoolsTwoSteps,
        },
        'Curve V3': {
            marketUnitPrice: new BigNumber(NaN),
            pools: fakePoolsNanMarketUnitPrice,
        },
        '1inch': {
            ...generateFakeMarketData(isActive, approximateUnitPrice, collateralAmount, false),
            pools: fakePoolsOneStep,
        },
    };
    const suggestedMarketId = sortMarketDataRecords(marketDataRecords)[0][0];
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
        tokenName: collateralObject.tokenName,
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

export const generateFakeAuctions = function (number = random(5, 15)) {
    return Array(number).fill(null).map(generateFakeAuction);
};

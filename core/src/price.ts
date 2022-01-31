import type { Auction } from './types';
import BigNumber from './bignumber';

const checkAuctionStartDate = function (startDate: Date, currentDate: Date): void {
    const auctionStartTimestamp = startDate.getTime();
    if (Number.isNaN(auctionStartTimestamp) || currentDate.getTime() < auctionStartTimestamp) {
        throw new Error('The provided Auction Start time is invalid');
    }
};

const calculateElapsedSteps = function (auction: Auction, currentDate: Date): number | undefined {
    if (auction.secondsBetweenPriceDrops === undefined) {
        return;
    }
    checkAuctionStartDate(auction.startDate, currentDate);
    const auctionStartTimestamp = auction.startDate.getTime();
    const elapsedTime = (currentDate.getTime() - auctionStartTimestamp) / 1000;
    return Math.floor(elapsedTime / auction.secondsBetweenPriceDrops);
};

export const calculateAuctionPrice = function (auction: Auction, currentDate: Date): BigNumber {
    checkAuctionStartDate(auction.startDate, currentDate);
    const amountOfSteps = calculateElapsedSteps(auction, currentDate);
    if (auction.priceDropRatio === undefined || amountOfSteps === undefined) {
        return auction.unitPrice;
    }
    return auction.initialPrice.multipliedBy(auction.priceDropRatio.pow(amountOfSteps));
};

export const calculateAuctionDropTime = function (auction: Auction, currentDate: Date): number | undefined {
    if (auction.secondsBetweenPriceDrops === undefined) {
        return;
    }
    checkAuctionStartDate(auction.startDate, currentDate);
    const auctionStartTimestamp = auction.startDate.getTime();
    const elapsedTime = (currentDate.getTime() - auctionStartTimestamp) / 1000;
    return auction.secondsBetweenPriceDrops - (elapsedTime % auction.secondsBetweenPriceDrops);
};

export const calculateTransactionProfit = function (auction: Auction): BigNumber {
    if (!auction.marketUnitPrice) {
        return new BigNumber(0);
    }
    const totalMarketPrice = auction.collateralAmount.multipliedBy(auction.marketUnitPrice);
    if (totalMarketPrice <= auction.debtDAI) {
        return totalMarketPrice.minus(auction.totalPrice);
    }
    const collateralAmountLimitedByDebt = auction.debtDAI.dividedBy(auction.approximateUnitPrice);
    const totalMarketPriceLimitedByDebt = collateralAmountLimitedByDebt.multipliedBy(auction.marketUnitPrice);
    return totalMarketPriceLimitedByDebt.minus(auction.debtDAI);
};

export const calculateTransactionProfitDate = function (auction: Auction): Date | undefined {
    if (
        auction.secondsBetweenPriceDrops === undefined ||
        auction.secondsTillNextPriceDrop === undefined ||
        auction.marketUnitPrice === undefined ||
        auction.priceDropRatio === undefined
    ) {
        return undefined;
    }

    const isAlreadyProfitable = auction.approximateUnitPrice.isLessThan(auction.marketUnitPrice);
    const date = new Date();

    let steps = 0;
    let currentValue = auction.approximateUnitPrice;
    let secondsTillProfitable = 0;

    if (isAlreadyProfitable) {
        while (currentValue.isLessThan(auction.marketUnitPrice)) {
            steps -= 1;
            currentValue = currentValue.multipliedBy(new BigNumber(1).minus(auction.priceDropRatio).plus(1));
        }
        secondsTillProfitable = auction.secondsBetweenPriceDrops * steps + auction.secondsTillNextPriceDrop;
    } else {
        while (currentValue.isGreaterThan(auction.marketUnitPrice)) {
            steps += 1;
            currentValue = currentValue.multipliedBy(auction.priceDropRatio);
        }
        const secondsSinceLastPriceDrop = auction.secondsBetweenPriceDrops - auction.secondsTillNextPriceDrop;
        secondsTillProfitable = auction.secondsBetweenPriceDrops * steps - secondsSinceLastPriceDrop;
    }

    date.setSeconds(date.getSeconds() + secondsTillProfitable);
    return date;
};

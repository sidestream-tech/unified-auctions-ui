import type { Auction, AuctionTransaction } from './types';
import BigNumber from './bignumber';
import { addSeconds } from 'date-fns';

const checkAuctionStartDate = function (startDate: Date, currentDate: Date): void {
    const auctionStartTimestamp = startDate.getTime();
    if (Number.isNaN(auctionStartTimestamp)) {
        throw new Error('Provided auction start time is invalid');
    }
    if (currentDate.getTime() < auctionStartTimestamp) {
        throw new Error('Auction start time is bigger than current block time');
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

export const calculateTransactionGrossProfit = function (auction: Auction): BigNumber {
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

export const calculateBidTransactionCollateralProfit = function (
    bidAmountDai: BigNumber,
    auction: AuctionTransaction
): BigNumber {
    // Based on the clipper contract logic
    // https://github.com/makerdao/dss/blob/60690042965500992490f695cf259256cc94c140/src/clip.sol#L357-L380
    const collateralToBuyForTheBid = bidAmountDai.dividedBy(auction.unitPrice);
    if (bidAmountDai.isGreaterThan(auction.debtDAI)) {
        return auction.debtDAI.dividedBy(auction.unitPrice);
    } else if (bidAmountDai.isLessThan(auction.debtDAI) && collateralToBuyForTheBid < auction.collateralAmount) {
        if (auction.debtDAI.minus(bidAmountDai).isLessThan(auction.minimumBidDai)) {
            return auction.debtDAI.minus(auction.minimumBidDai).dividedBy(auction.unitPrice);
        }
    }
    return collateralToBuyForTheBid;
};

export const calculateTransactionGrossProfitDate = function (auction: Auction, currentDate: Date): Date | undefined {
    if (
        auction.secondsBetweenPriceDrops === undefined ||
        auction.secondsTillNextPriceDrop === undefined ||
        auction.marketUnitPrice === undefined ||
        auction.priceDropRatio === undefined ||
        !auction.isActive ||
        auction.isFinished
    ) {
        return undefined;
    }

    const isAlreadyProfitable = auction.approximateUnitPrice.isLessThan(auction.marketUnitPrice);

    if (isAlreadyProfitable) {
        return undefined;
    }

    let steps = 0;
    let currentValue = new BigNumber(auction.approximateUnitPrice);

    while (currentValue.isGreaterThan(auction.marketUnitPrice)) {
        steps += 1;
        currentValue = currentValue.multipliedBy(auction.priceDropRatio);
    }
    const secondsSinceLastPriceDrop = auction.secondsBetweenPriceDrops - auction.secondsTillNextPriceDrop;
    const secondsTillProfitable = auction.secondsBetweenPriceDrops * steps - secondsSinceLastPriceDrop;
    return addSeconds(currentDate, secondsTillProfitable);
};

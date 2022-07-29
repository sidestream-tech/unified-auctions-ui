import type { Auction } from './types';
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
    const distance = elapsedTime / auction.secondsBetweenPriceDrops;
    return Math.floor(distance);
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
    const totalDebtMarketPrice = auction.collateralToCoverDebt.multipliedBy(auction.marketUnitPrice);
    const totalDebtPrice = auction.collateralToCoverDebt.multipliedBy(auction.approximateUnitPrice);
    return totalDebtMarketPrice.minus(totalDebtPrice);
};

export const calculateTransactionCollateralOutcome = function (
    bidAmountDai: BigNumber,
    unitPrice: BigNumber,
    auction: Auction
): BigNumber {
    // Based on the clipper contract logic
    // https://github.com/makerdao/dss/blob/60690042965500992490f695cf259256cc94c140/src/clip.sol#L357-L380
    const collateralToBuyForTheBid = bidAmountDai.dividedBy(unitPrice);
    const potentialOutcomeCollateralAmount = BigNumber.minimum(collateralToBuyForTheBid, auction.collateralAmount); // slice
    const potentialOutcomeTotalPrice = potentialOutcomeCollateralAmount.multipliedBy(unitPrice); // owe
    const difference = new BigNumber(potentialOutcomeTotalPrice.minus(auction.debtDAI).toPrecision(16));
    if (
        // if owe > tab
        // soft compensation because of precision problems.
        difference.isLessThan(0)
    ) {
        return auction.debtDAI.dividedBy(unitPrice); // return tab / price
    } else if (
        // if owe < tab && slice < lot
        potentialOutcomeTotalPrice.isLessThan(auction.debtDAI) &&
        potentialOutcomeCollateralAmount.isLessThan(auction.collateralAmount)
    ) {
        if (
            // if tab - owe < _chost
            auction.debtDAI.minus(potentialOutcomeTotalPrice).isLessThan(auction.minimumBidDai)
        ) {
            if (
                // if tab > _chost
                auction.debtDAI.isLessThanOrEqualTo(auction.minimumBidDai)
            ) {
                // shouldn't be possible to left less than minimumBidDai
                return new BigNumber(NaN);
            }
            // tab - _chost / price
            return auction.debtDAI.minus(auction.minimumBidDai).dividedBy(unitPrice);
        }
    }
    return potentialOutcomeCollateralAmount;
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

    const stepNumber = Math.ceil(
        Math.log(auction.marketUnitPrice.dividedBy(auction.approximateUnitPrice).toNumber()) /
            Math.log(auction.priceDropRatio.toNumber())
    );

    const secondsSinceLastPriceDrop = auction.secondsBetweenPriceDrops - auction.secondsTillNextPriceDrop;
    const secondsTillProfitable = auction.secondsBetweenPriceDrops * stepNumber - secondsSinceLastPriceDrop;
    return addSeconds(currentDate, secondsTillProfitable);
};

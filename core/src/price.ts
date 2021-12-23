import type { Auction, AuctionInitialInfo } from './types';
import BigNumber from './bignumber';

const checkAuctionStartDate = function (startDate: Date, currentDate: Date): void {
    const auctionStartTimestamp = startDate.getTime();
    if (Number.isNaN(auctionStartTimestamp)) {
        throw new Error('The provided Auction Start time is invalid');
    }
    if (currentDate.getTime() <= auctionStartTimestamp) {
        throw new Error('The provided Auction Start time is invalid');
    }
};

const calculateElapsedSteps = function (auction: Auction | AuctionInitialInfo, currentDate: Date): number {
    checkAuctionStartDate(auction.start, currentDate);

    const auctionStartTimestamp = auction.start.getTime();

    const elapsedTime = (currentDate.getTime() - auctionStartTimestamp) / 1000;

    return Math.floor(elapsedTime / auction.step.toNumber());
};

export const calculateAuctionPrice = function (auction: Auction | AuctionInitialInfo, currentDate: Date): BigNumber {
    checkAuctionStartDate(auction.start, currentDate);
    const steps = calculateElapsedSteps(auction, currentDate);
    return auction.initialPrice.multipliedBy(auction.cut.pow(steps));
};

export const calculateAuctionDropTime = function (auction: Auction | AuctionInitialInfo, currentDate: Date): number {
    checkAuctionStartDate(auction.start, currentDate);

    const auctionStartTimestamp = auction.start.getTime();
    const elapsedTime = (currentDate.getTime() - auctionStartTimestamp) / 1000;
    return auction.step.toNumber() - (elapsedTime % auction.step.toNumber());
};

export const calculateTransactionProfit = function (auction: Auction): BigNumber {
    if (!auction.marketPricePerCollateral) {
        return new BigNumber(0);
    }
    const totalMarketValue = auction.amountRAW.multipliedBy(auction.marketPricePerCollateral);
    if (totalMarketValue <= auction.debtDAI) {
        return totalMarketValue.minus(auction.amountDAI);
    }
    const collateralAmountLimitedByDebt = auction.debtDAI.dividedBy(auction.amountPerCollateral);
    const totalMarketValueLimitedByDebt = collateralAmountLimitedByDebt.multipliedBy(auction.marketPricePerCollateral);
    return totalMarketValueLimitedByDebt.minus(auction.debtDAI);
};

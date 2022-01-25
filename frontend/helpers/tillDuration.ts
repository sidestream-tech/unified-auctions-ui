import { intervalToDuration, formatDistance, Duration } from 'date-fns';
import { AuctionTransaction } from 'auctions-core/src/types';

const formatDuration = function (duration: Duration): string {
    // formats duration into `1y 2m 3d 4h 5m 6s` format
    const periodNames: Array<keyof Duration> = ['years', 'months', 'days', 'hours', 'minutes', 'seconds'];
    const output = periodNames.map(periodName => {
        if (duration[periodName] === 0 && !['hours', 'minutes', 'seconds'].includes(periodName)) {
            return undefined;
        }
        return `${duration[periodName]}${periodName.charAt(0)}`;
    });
    return output.join(' ');
};

export const formatInterval = function (startDate: Date, endDate: Date): string {
    if (startDate < endDate) {
        const duration = intervalToDuration({
            start: startDate,
            end: endDate,
        });
        return formatDuration(duration);
    } else {
        return formatDistance(endDate, startDate, {
            addSuffix: true,
        });
    }
};

export const calculateTimeTillProfitable = function (auction: AuctionTransaction) {
    if (
        auction.secondsBetweenPriceDrops === undefined ||
        auction.secondsTillNextPriceDrop === undefined ||
        auction.marketUnitPrice === undefined ||
        auction.priceDropRatio === undefined
    ) {
        return 0;
    }

    const currentStepProgress = auction.secondsBetweenPriceDrops - auction.secondsTillNextPriceDrop;
    const stepsTillProfitable = Math.round(
        auction.approximateUnitPrice.dividedBy(auction.priceDropRatio).minus(auction.marketUnitPrice).toNumber()
    );
    return auction.secondsBetweenPriceDrops * stepsTillProfitable - currentStepProgress;
};

import { intervalToDuration, formatDistance, Duration, differenceInDays } from 'date-fns';

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

export const formatSeconds = function (seconds: number): string {
    const duration = intervalToDuration({
        start: new Date(0),
        end: new Date(seconds * 1000),
    });
    return formatDuration(duration);
};

export const formatInterval = function (startDate: Date, endDate: Date): string {
    if (startDate < endDate) {
        const duration = intervalToDuration({
            start: startDate,
            end: endDate,
        });
        return formatDuration(duration);
    } else {
        // check if difference between start and end dates is a day or more
        if (differenceInDays(startDate, endDate) >= 1) {
            // return less precise duration
            return formatDistance(endDate, startDate, {
                addSuffix: true,
            });
        }
        // switch start and end dates to count up
        const duration = intervalToDuration({
            start: endDate,
            end: startDate,
        });
        return `${formatDuration(duration)} ago`;
    }
};

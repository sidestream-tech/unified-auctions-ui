import { intervalToDuration, formatDistance, Duration } from 'date-fns';

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

export const formatInterval = function (startDate: Date, endDate: Date, isCountUp: boolean = false): string {
    if (startDate < endDate || isCountUp) {
        // switch startDate and endDate to act as a count-up timer
        const duration = intervalToDuration({
            start: isCountUp ? endDate : startDate,
            end: isCountUp ? startDate : endDate,
        });
        return formatDuration(duration);
    } else {
        return formatDistance(endDate, startDate, {
            addSuffix: true,
        });
    }
};

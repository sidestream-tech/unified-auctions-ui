import { intervalToDuration, Duration } from 'date-fns';

const formatDuration = function (duration: Duration): string {
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
    const duration = intervalToDuration({
        start: startDate,
        end: endDate,
    });
    const formatDurationString = formatDuration(duration);

    if (startDate > endDate) {
        return `${formatDurationString} ago`;
    }
    return formatDuration(duration);
};

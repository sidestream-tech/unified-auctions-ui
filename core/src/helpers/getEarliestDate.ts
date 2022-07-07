export const getEarliestDate = function (first: Date, second: Date): Date {
    if (first > second) {
        return second;
    }
    return first;
};

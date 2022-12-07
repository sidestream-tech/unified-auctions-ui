import BigNumber from 'bignumber.js';

const DECIMAL_PLACES_DEFAULT = 2;
const DECIMAL_PLACES_MAX = 5;

export function isValidNumber(value: number | BigNumber): boolean {
    if (BigNumber.isBigNumber(value) && value.isNaN()) {
        return false;
    }
    if (value === undefined || value === null || Number.isNaN(value)) {
        return false;
    }
    return true;
}

function dynamicDecimalPlaces(value: number | BigNumber, decimalPlaces: number): number {
    if (!isValidNumber(value) || isZero(value)) {
        return decimalPlaces;
    }
    if (Math.abs(Number(value)) > 1) {
        return decimalPlaces;
    }
    const amountOfZerosInValue = Math.abs(Math.floor(Math.log10(Math.abs(Number(value)))));
    if (amountOfZerosInValue < decimalPlaces) {
        return decimalPlaces;
    }
    if (amountOfZerosInValue > DECIMAL_PLACES_MAX) {
        return DECIMAL_PLACES_MAX;
    }
    return amountOfZerosInValue;
}

function smallestVisibleNumber(): BigNumber {
    return new BigNumber(1).shiftedBy(-DECIMAL_PLACES_MAX);
}

function isZero(value: number | BigNumber) {
    if (BigNumber.isBigNumber(value) && value.isEqualTo(0)) {
        return true;
    }
    if (value === 0) {
        return true;
    }
    return false;
}

export function isValueSmallButNotZero(value: number | BigNumber): boolean {
    if (isZero(value)) {
        return false;
    }
    return new BigNumber(value).abs().isLessThan(smallestVisibleNumber());
}

function limitedValue(value: number | BigNumber): number | BigNumber {
    if (isValueSmallButNotZero(value)) {
        return Number(value) < 0 ? smallestVisibleNumber().multipliedBy(-1) : smallestVisibleNumber();
    }
    return value;
}

export function formatWithThousandSeparators(value: string): string {
    // We choose regex over native JS solutions, as using native solutions only support numbers
    const parts = value.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
}

interface formatToAutomaticDecimalPointsOptions {
    decimalPlaces: number;
    disableThousandSeparators: boolean;
}

export function formatToAutomaticDecimalPoints(
    value: number | BigNumber,
    options?: formatToAutomaticDecimalPointsOptions
): string {
    const formattedValue = limitedValue(value).toFixed(
        dynamicDecimalPlaces(value, options?.decimalPlaces || DECIMAL_PLACES_DEFAULT)
    );
    if (options?.disableThousandSeparators) {
        return formattedValue;
    }
    return formatWithThousandSeparators(formattedValue);
}

export function formatToAutomaticDecimalPointsString(
    value: number | BigNumber,
    options?: formatToAutomaticDecimalPointsOptions
) {
    const formattedValue = formatToAutomaticDecimalPoints(value, options);
    return isValueSmallButNotZero(value) ? `under ${formattedValue}` : formattedValue;
}

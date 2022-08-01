import type { AuctionInitialInfo } from 'auctions-core/src/types';
import BigNumber from 'auctions-core/node_modules/bignumber.js/bignumber';
import { sendNotification } from './twitter';

const DECIMAL_PLACES_DEFAULT = 2;
const DECIMAL_PLACES_MAX = 5;

function isValidNumber(value: BigNumber): boolean {
    if (BigNumber.isBigNumber(value) && value.isNaN()) {
        return false;
    }
    if (value === undefined || value === null || Number.isNaN(value)) {
        return false;
    }
    return true;
}

function dynamicDecimalPlaces(value: BigNumber): number {
    if (!isValidNumber(value) || isZero(value)) {
        return DECIMAL_PLACES_DEFAULT;
    }
    if (Math.abs(Number(value)) > 1) {
        return DECIMAL_PLACES_DEFAULT;
    }
    const amountOfZerosInValue = Math.abs(Math.floor(Math.log10(Math.abs(Number(value)))));
    if (amountOfZerosInValue < DECIMAL_PLACES_DEFAULT) {
        return DECIMAL_PLACES_DEFAULT;
    }
    if (amountOfZerosInValue > DECIMAL_PLACES_MAX) {
        return DECIMAL_PLACES_MAX;
    }
    return amountOfZerosInValue;
}

function smallestVisibleNumber(): BigNumber {
    return new BigNumber(1).shiftedBy(-DECIMAL_PLACES_MAX);
}

function isZero(value: BigNumber) {
    if (value.isEqualTo(0)) {
        return true;
    }
    return false;
}

function isValueSmallButNotZero(value: BigNumber): boolean {
    if (isZero(value)) {
        return false;
    }
    return new BigNumber(value).abs().isLessThan(smallestVisibleNumber());
}

function limitedValue(value: BigNumber): BigNumber {
    if (isValueSmallButNotZero(value)) {
        return value.isLessThan(0) ? smallestVisibleNumber().multipliedBy(-1) : smallestVisibleNumber();
    }
    return value;
}

function format(value: BigNumber): string {
    return value.toFixed(dynamicDecimalPlaces(value));
}

const generateNotificationText = function (auction: AuctionInitialInfo): string {
    const url = `${process.env.FRONTEND_ORIGIN}/collateral/?network=${auction.network}&auction=${auction.id}`;
    return `Collateral auction with ${format(limitedValue(auction.collateralAmount))} ${
        auction.collateralSymbol
    } just started. Follow the link to participate: ${url}`;
};

const notify = async function (auction: AuctionInitialInfo) {
    const text = generateNotificationText(auction);
    console.info(`notify: content "${text}"`);
    await sendNotification(text);
};

export default notify;

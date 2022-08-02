import type { AuctionInitialInfo } from 'auctions-core/src/types';
import {
    isValueSmallButNotZero,
    formatToAutomaticDecimalPoints,
} from 'auctions-core/src/helpers/formatToAutomaticDecimalPoints';
import { sendNotification } from './twitter';

const generateNotificationText = function (auction: AuctionInitialInfo): string {
    const url = `${process.env.FRONTEND_ORIGIN}/collateral/?network=${auction.network}&auction=${auction.id}`;
    const formattedValue = formatToAutomaticDecimalPoints(auction.collateralAmount);
    const displayValue = isValueSmallButNotZero(auction.collateralAmount) ? `under ${formattedValue}` : formattedValue;

    return `Collateral auction with ${displayValue} ${auction.collateralSymbol} just started. Follow the link to participate: ${url}`;
};

const notify = async function (auction: AuctionInitialInfo) {
    const text = generateNotificationText(auction);
    console.info(`notify: content "${text}"`);
    await sendNotification(text);
};

export default notify;

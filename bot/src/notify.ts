import type { AuctionInitialInfo } from 'auctions-core/src/types';
import { formatToAutomaticDecimalPointsString } from 'auctions-core/src/helpers/formatToAutomaticDecimalPoints';
import { sendNotification } from './twitter';

const generateNotificationText = function (auction: AuctionInitialInfo): string {
    const url = `${process.env.FRONTEND_ORIGIN}/collateral/?network=${auction.network}&auction=${auction.id}`;
    const formattedString = formatToAutomaticDecimalPointsString(auction.collateralAmount);

    return `Collateral auction with ${formattedString} ${auction.collateralSymbol} just started. Follow the link to participate: ${url}`;
};

const notify = async function (auction: AuctionInitialInfo) {
    const text = generateNotificationText(auction);
    console.info(`notify: content "${text}"`);
    await sendNotification(text);
};

export default notify;

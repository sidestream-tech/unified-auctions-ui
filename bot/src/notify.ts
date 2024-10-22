import type { AuctionInitialInfo, DebtAuctionActive } from 'auctions-core/src/types';
import { formatToAutomaticDecimalPointsString } from 'auctions-core/src/helpers/formatToAutomaticDecimalPoints';
import { sendNotification } from './twitter';

const generateNotificationTextCollateral = function (auction: AuctionInitialInfo): string {
    const url = `${process.env.FRONTEND_ORIGIN}/collateral/?network=${auction.network}&auction=${auction.id}`;
    const formattedString = formatToAutomaticDecimalPointsString(auction.collateralAmount);

    return `Collateral auction with ${formattedString} ${auction.tokenName} just started. Follow the link to participate: ${url}`;
};

const generateNotificationTextDebt = function (auction: DebtAuctionActive): string {
    const url = `${process.env.FRONTEND_ORIGIN}/debt/?network=${auction.network}&auction=${auction.id}`;
    return `Debt auction with fixed bid amount of ${formatToAutomaticDecimalPointsString(
        auction.bidAmountDai
    )} DAI and current compensation of ${formatToAutomaticDecimalPointsString(
        auction.receiveAmountMKR
    )} MKR just started. Follow the link to participate: ${url}`;
};

export const notifyCollateral = async function (auction: AuctionInitialInfo) {
    const text = generateNotificationTextCollateral(auction);
    console.info(`Collateral auction notification: "${text}"`);
    await sendNotification(text);
};

export const notifyDebt = async function (auction: DebtAuctionActive) {
    const text = generateNotificationTextDebt(auction);
    console.info(`Debt auction notification: "${text}"`);
    await sendNotification(text);
};

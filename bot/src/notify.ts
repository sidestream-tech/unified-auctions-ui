import type { AuctionInitialInfo, SurplusAuctionActive } from 'auctions-core/src/types';
import { sendNotification } from './twitter';

const generateNotificationTextCollateral = function (auction: AuctionInitialInfo): string {
    const url = `${process.env.FRONTEND_ORIGIN}/collateral/?network=${auction.network}&auction=${auction.id}`;
    return `Collateral auction with ${auction.collateralAmount.toFixed(2)} ${
        auction.collateralSymbol
    } just started. Follow the link to participate: ${url}`;
};

const generateNotificationTextSurplus = function (auction: SurplusAuctionActive): string {
    const url = `${process.env.FRONTEND_ORIGIN}/surplus/?network=${auction.network}&auction=${auction.id}`;
    return `Surplus auction with ${auction.receiveAmountDAI.toFixed(
        0
    )} DAI just started. Follow the link to participate: ${url}`;
};

export const notifyCollateral = async function (auction: AuctionInitialInfo) {
    const text = generateNotificationTextCollateral(auction);
    console.info(`Collateral auction notification: "${text}"`);
    await sendNotification(text);
};

export const notifySurplus = async function (auction: SurplusAuctionActive) {
    const text = generateNotificationTextSurplus(auction);
    console.info(`Surplus auction notification: "${text}"`);
    await sendNotification(text);
};

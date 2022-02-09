import type { Auction, AuctionInitialInfo, AuctionTransaction, Notifier } from './types';
import BigNumber from './bignumber';
import fetchAuctionsByCollateralType, { fetchAuctionStatus } from './fetch';
import { getCalleeData, getMarketPrice } from './calleeFunctions';
import { fetchCalcParametersByCollateralType } from './params';
import executeTransaction from './execute';
import { RAY_NUMBER_OF_DIGITS, WAD_NUMBER_OF_DIGITS } from './constants/UNITS';
import { getCalleeAddressByCollateralType } from './constants/CALLEES';
import {
    calculateAuctionDropTime,
    calculateAuctionPrice,
    calculateTransactionProfit,
    calculateTransactionProfitDate,
} from './price';
import { getSupportedCollateralTypes } from './addresses';
import { getClipperNameByCollateralType } from './contracts';
import convertNumberTo32Bytes from './helpers/convertNumberTo32Bytes';
import { enrichAuctionWithTransactionFees, getApproximateTransactionFees } from './fees';
import getNetworkDate from './date';

const enrichAuctionWithActualNumbers = async function (
    network: string,
    auction: AuctionInitialInfo
): Promise<Auction> {
    if (!auction.isActive || auction.isFinished) {
        return {
            ...auction,
            unitPrice: new BigNumber(0),
            approximateUnitPrice: new BigNumber(0),
            totalPrice: new BigNumber(0),
        };
    }
    const auctionStatus = await fetchAuctionStatus(network, auction.collateralType, auction.auctionId);
    return {
        ...auction,
        ...auctionStatus,
        approximateUnitPrice: auctionStatus.unitPrice,
    };
};

const enrichAuctionWithMarketValues = async function (auction: Auction, network: string): Promise<Auction> {
    if (!auction.isActive || !auction.approximateUnitPrice || auction.isFinished) {
        return auction;
    }
    try {
        const marketUnitPrice = await getMarketPrice(network, auction.collateralSymbol, auction.collateralAmount);
        const marketUnitPriceToUnitPriceRatio = auction.approximateUnitPrice
            .minus(marketUnitPrice)
            .dividedBy(marketUnitPrice);
        const auctionWithMarketValues = {
            ...auction,
            marketUnitPrice,
            marketUnitPriceToUnitPriceRatio,
        };
        return {
            ...auctionWithMarketValues,
            transactionProfit: calculateTransactionProfit(auctionWithMarketValues),
        };
    } catch (error) {
        console.warn(
            `Fetching exchange rates from UniSwap failed for ${auction.id} with error:`,
            error instanceof Error && error.message
        );
        return auction;
    }
};

export const enrichAuctionWithPriceDrop = async function (auction: Auction): Promise<Auction> {
    if (!auction.isActive || auction.isFinished) {
        return auction;
    }
    const params = await fetchCalcParametersByCollateralType(auction.network, auction.collateralType);
    const auctionWithParams = {
        ...auction,
        secondsBetweenPriceDrops: params.secondsBetweenPriceDrops,
        priceDropRatio: params.priceDropRatio,
    };
    const currentDate = await getNetworkDate(auction.network);
    const secondsTillNextPriceDrop = calculateAuctionDropTime(auctionWithParams, currentDate);
    const approximateUnitPrice = calculateAuctionPrice(auctionWithParams, currentDate);
    const totalPrice = auction.collateralAmount.multipliedBy(approximateUnitPrice);
    const transactionProfitDate = calculateTransactionProfitDate(auctionWithParams, currentDate);
    return {
        ...auctionWithParams,
        secondsTillNextPriceDrop,
        approximateUnitPrice,
        totalPrice,
        transactionProfitDate,
    };
};

export const enrichAuctionWithPriceDropAndMarketValue = async function (
    auction: Auction,
    network: string
): Promise<Auction> {
    const enrichedAuctionWithNewPriceDrop = await enrichAuctionWithPriceDrop(auction);
    return await enrichAuctionWithMarketValues(enrichedAuctionWithNewPriceDrop, network);
};

export const fetchAllInitialAuctions = async function (network: string): Promise<AuctionInitialInfo[]> {
    const collateralTypes = await getSupportedCollateralTypes(network);
    const auctionGroupsPromises = collateralTypes.map((collateralType: string) => {
        return fetchAuctionsByCollateralType(network, collateralType);
    });
    const auctionGroups = await Promise.all(auctionGroupsPromises);
    return auctionGroups.flat();
};

export const fetchAllAuctions = async function (network: string): Promise<AuctionTransaction[]> {
    const auctions = await fetchAllInitialAuctions(network);

    // enrich them with statuses
    const auctionsWithStatusesPromises = auctions.map((auction: AuctionInitialInfo) =>
        enrichAuctionWithActualNumbers(network, auction)
    );
    const auctionsWithStatuses = await Promise.all(auctionsWithStatusesPromises);

    // enrich them with price drop
    const auctionsWithPriceDrop = await Promise.all(auctionsWithStatuses.map(enrichAuctionWithPriceDrop));

    // enrich them with market values
    const auctionsWithMarketValue = await Promise.all(
        auctionsWithPriceDrop.map(a => enrichAuctionWithMarketValues(a, network))
    );

    // enrich with profit and fee calculation
    const fees = await getApproximateTransactionFees(network);
    return await Promise.all(auctionsWithMarketValue.map(a => enrichAuctionWithTransactionFees(a, fees)));
};

export const restartAuction = async function (
    network: string,
    auction: Auction,
    profitAddress: string,
    notifier?: Notifier
): Promise<string> {
    const contractName = getClipperNameByCollateralType(auction.collateralType);
    return executeTransaction(network, contractName, 'redo', [auction.auctionId, profitAddress], notifier, false);
};

export const bidOnTheAuction = async function (
    network: string,
    auction: Auction,
    profitAddress: string,
    notifier?: Notifier
): Promise<string> {
    const calleeAddress = getCalleeAddressByCollateralType(network, auction.collateralType);
    const calleeData = await getCalleeData(network, auction.collateralType, profitAddress);
    const contractName = getClipperNameByCollateralType(auction.collateralType);
    const contractParameters = [
        convertNumberTo32Bytes(auction.auctionId),
        auction.collateralAmount.shiftedBy(WAD_NUMBER_OF_DIGITS).toFixed(),
        auction.unitPrice.shiftedBy(RAY_NUMBER_OF_DIGITS).toFixed(),
        calleeAddress,
        calleeData,
    ];
    return executeTransaction(network, contractName, 'take', contractParameters, notifier);
};

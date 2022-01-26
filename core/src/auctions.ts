import type { Auction, AuctionInitialInfo, Notifier } from './types';
import BigNumber from './bignumber';
import getMaker from './maker';
import fetchAuctionsByCollateralType from './fetch';
import { getExchangeRateBySymbol, getUniswapCalleeBySymbol, getUniswapParametersByCollateral } from './uniswap';
import { fetchCalcParametersByCollateralType } from './params';
import executeTransaction from './execute';
import { RAD, RAY, RAY_NUMBER_OF_DIGITS, WAD, WAD_NUMBER_OF_DIGITS } from './constants/UNITS';
import { calculateAuctionDropTime, calculateAuctionPrice, calculateTransactionProfit } from './price';
import { getSupportedCollateralTypes } from './addresses';
import { getClipperNameByCollateralType } from './contracts';
import convertNumberTo32Bytes from './helpers/convertNumberTo32Bytes';

const enrichAuctionWithActualNumbers = async function (
    auction: AuctionInitialInfo,
    network?: string
): Promise<Auction> {
    const maker = await getMaker(network);
    if (!auction.isActive) {
        return {
            ...auction,
            unitPrice: new BigNumber(0),
            approximateUnitPrice: new BigNumber(0),
            totalPrice: new BigNumber(0),
        };
    }
    const status = await maker.service('liquidation').getStatus(auction.collateralType, auction.auctionId);
    const unitPrice = new BigNumber(status.price).div(RAY);
    const collateralAmount = new BigNumber(status.lot).div(WAD);
    return {
        ...auction,
        isActive: !status.needsRedo,
        debtDAI: new BigNumber(status.tab).div(RAD),
        collateralAmount,
        unitPrice,
        approximateUnitPrice: unitPrice,
        totalPrice: collateralAmount.multipliedBy(unitPrice),
    };
};

const enrichAuctionWithMarketValues = async function (auction: Auction, network: string): Promise<Auction> {
    if (!auction.isActive || !auction.approximateUnitPrice) {
        return auction;
    }
    try {
        const marketUnitPrice = await getExchangeRateBySymbol(
            network,
            auction.collateralSymbol,
            auction.collateralAmount
        );
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
    if (!auction.isActive) {
        return auction;
    }
    const params = await fetchCalcParametersByCollateralType(auction.network, auction.collateralType);
    const auctionWithParams = {
        ...auction,
        secondsBetweenPriceDrops: params.secondsBetweenPriceDrops,
        priceDropRatio: params.priceDropRatio,
    };
    const currentDate = new Date();
    const secondsTillNextPriceDrop = calculateAuctionDropTime(auctionWithParams, currentDate);
    const approximateUnitPrice = calculateAuctionPrice(auctionWithParams, currentDate);
    const totalPrice = auction.collateralAmount.multipliedBy(approximateUnitPrice);
    return {
        ...auctionWithParams,
        secondsTillNextPriceDrop,
        approximateUnitPrice,
        totalPrice,
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

export const fetchAllAuctions = async function (network: string): Promise<Auction[]> {
    const auctions = await fetchAllInitialAuctions(network);

    // enrich them with statuses
    const auctionsWithStatusesPromises = auctions.map((auction: AuctionInitialInfo) =>
        enrichAuctionWithActualNumbers(auction, network)
    );
    const auctionsWithStatuses = await Promise.all(auctionsWithStatusesPromises);

    // enrich them with price drop
    const auctionsWithPriceDrop = await Promise.all(auctionsWithStatuses.map(enrichAuctionWithPriceDrop));

    // enrich them with market values
    return await Promise.all(auctionsWithPriceDrop.map(a => enrichAuctionWithMarketValues(a, network)));
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
    const calleeAddress = getUniswapCalleeBySymbol(network, auction.collateralSymbol);
    const flashData = await getUniswapParametersByCollateral(network, auction.collateralType, profitAddress);
    const contractName = getClipperNameByCollateralType(auction.collateralType);
    const contractParameters = [
        convertNumberTo32Bytes(auction.auctionId),
        auction.collateralAmount.shiftedBy(WAD_NUMBER_OF_DIGITS).toFixed(),
        auction.unitPrice.shiftedBy(RAY_NUMBER_OF_DIGITS).toFixed(),
        calleeAddress,
        flashData,
    ];
    return executeTransaction(network, contractName, 'take', contractParameters, notifier);
};

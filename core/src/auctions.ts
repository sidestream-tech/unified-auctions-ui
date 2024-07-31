import type {
    Auction,
    AuctionInitialInfo,
    AuctionTransaction,
    Notifier,
    TakeEvent,
    MarketData,
    ExchangeFees,
    GetCalleeDataParams,
} from './types';
import BigNumber from './bignumber';
import fetchAuctionsByCollateralType, {
    fetchAuctionByCollateralTypeAndAuctionIndex,
    fetchAuctionStatus,
    fetchMinimumBidDai,
} from './fetch';
import { getBestMarketId, getCalleeData, getMarketDataRecords, getMarketPrice } from './calleeFunctions';
import { fetchCalcParametersByCollateralType } from './params';
import executeTransaction from './execute';
import { RAY_NUMBER_OF_DIGITS, WAD_NUMBER_OF_DIGITS, NULL_BYTES } from './constants/UNITS';
import { getCalleeAddressByCollateralType } from './constants/CALLEES';
import {
    calculateAuctionDropTime,
    calculateAuctionPrice,
    calculateTransactionGrossProfit,
    calculateTransactionGrossProfitDate,
    calculateTransactionCollateralOutcome,
} from './price';
import { getSupportedCollateralTypes } from './addresses';
import getContract, { getClipperNameByCollateralType } from './contracts';
import convertNumberTo32Bytes from './helpers/convertNumberTo32Bytes';
import { enrichAuctionWithTransactionFees, getApproximateTransactionFees, getDefaultMarketFee } from './fees';
import parseAuctionId from './helpers/parseAuctionId';
import { EventFilter } from 'ethers';
import getNetworkDate, { fetchDateByBlockNumber } from './date';

const enrichAuctionWithActualNumbers = async function (
    network: string,
    auction: AuctionInitialInfo
): Promise<Auction> {
    const defaultAcution = {
        ...auction,
        minimumBidDai: new BigNumber(0),
        unitPrice: new BigNumber(0),
        approximateUnitPrice: new BigNumber(0),
        totalPrice: new BigNumber(0),
        collateralToCoverDebt: new BigNumber(NaN),
    };
    if (!auction.isActive || auction.isFinished) {
        return defaultAcution;
    }
    const auctionStatus = await fetchAuctionStatus(network, auction.collateralType, auction.index);
    const minimumBidDai = await fetchMinimumBidDai(network, auction.collateralType);
    return {
        ...defaultAcution,
        ...auctionStatus,
        minimumBidDai,
        approximateUnitPrice: auctionStatus.unitPrice,
    };
};

const calculateCollateralToCoverDebt = async function (network: string, auction: Auction): Promise<BigNumber> {
    const collateralToCoverDebt = calculateTransactionCollateralOutcome(
        auction.debtDAI,
        auction.approximateUnitPrice,
        auction
    );
    if (!collateralToCoverDebt.isNaN()) {
        return collateralToCoverDebt;
    }
    const marketPriceForAllCollateral = await getMarketPrice(
        network,
        auction.collateralSymbol,
        auction.collateralAmount
    );
    return auction.debtDAI.dividedBy(marketPriceForAllCollateral);
};

export const enrichMarketDataRecordsWithValues = async function (
    auction: AuctionTransaction,
    marketDataRecords: Record<string, MarketData>,
    exchangeFees: ExchangeFees,
    amount: BigNumber = new BigNumber(1)
): Promise<Record<string, MarketData>> {
    let enrichedMarketDataRecords = {};
    for (const marketId in marketDataRecords) {
        let marketData = marketDataRecords[marketId];
        // enrich with values dependent on marketUnitPrice
        const marketUnitPrice = marketData.marketUnitPrice;
        if (marketUnitPrice.isNaN()) {
            enrichedMarketDataRecords = {
                ...enrichedMarketDataRecords,
                [marketId]: { ...marketData },
            };
            continue;
        }
        marketData = {
            ...marketData,
            marketUnitPrice,
            marketUnitPriceToUnitPriceRatio: auction.approximateUnitPrice
                .minus(marketUnitPrice)
                .dividedBy(marketUnitPrice),
            ...exchangeFees,
            transactionGrossProfit: calculateTransactionGrossProfit(
                marketUnitPrice,
                amount,
                auction.approximateUnitPrice
            ),
        };
        // enrich with values dependent on fees
        if (marketData.transactionGrossProfit && auction.combinedSwapFeesDAI) {
            const transactionGrossProfit = marketData.transactionGrossProfit;
            marketData = {
                ...marketData,
                transactionNetProfit: transactionGrossProfit.minus(auction.combinedSwapFeesDAI),
            };
        }
        // enrich with values dependent on currentDate
        try {
            const currentDate = await getNetworkDate(auction.network);
            marketData = {
                ...marketData,
                transactionGrossProfitDate: calculateTransactionGrossProfitDate(auction, marketUnitPrice, currentDate),
            };
        } catch {}
        enrichedMarketDataRecords = {
            ...enrichedMarketDataRecords,
            [marketId]: { ...marketData },
        };
    }
    return enrichedMarketDataRecords;
};

export const enrichAuctionWithMarketDataRecords = async function (
    auction: AuctionTransaction,
    network: string,
    useAutoRouter = false
): Promise<AuctionTransaction> {
    if (!auction.isActive || !auction.approximateUnitPrice || auction.isFinished) {
        return auction;
    }
    try {
        const collateralToCoverDebt = await calculateCollateralToCoverDebt(network, auction);
        const exchangeFees = await getDefaultMarketFee(network);
        const marketDataRecords = await getMarketDataRecords(
            network,
            auction.collateralSymbol,
            collateralToCoverDebt,
            useAutoRouter
        );
        const enrichedMarketDataRecords = await enrichMarketDataRecordsWithValues(
            auction,
            marketDataRecords,
            exchangeFees,
            collateralToCoverDebt
        );
        const suggestedMarketId = await getBestMarketId(enrichedMarketDataRecords);
        const marketUnitPrice = enrichedMarketDataRecords[suggestedMarketId].marketUnitPrice;
        const marketUnitPriceToUnitPriceRatio =
            enrichedMarketDataRecords[suggestedMarketId].marketUnitPriceToUnitPriceRatio;
        const transactionGrossProfit = enrichedMarketDataRecords[suggestedMarketId].transactionGrossProfit;
        const transactionGrossProfitDate = enrichedMarketDataRecords[suggestedMarketId].transactionGrossProfitDate;
        const transactionNetProfit = enrichedMarketDataRecords[suggestedMarketId].transactionNetProfit;
        return {
            ...auction,
            collateralToCoverDebt,
            suggestedMarketId,
            marketUnitPrice,
            marketUnitPriceToUnitPriceRatio,
            transactionGrossProfit,
            transactionGrossProfitDate,
            transactionNetProfit: transactionNetProfit ? transactionNetProfit : new BigNumber(NaN),
            marketDataRecords: enrichedMarketDataRecords,
        };
    } catch (error: any) {
        // since it's expected that some collaterals are not tradable on some networks
        // we should just ignore this error
        console.warn(`auction ${auction.id} is not tradable`, error?.message);
        return auction;
    }
};

export const enrichAuctionWithPriceDrop = async function (auction: Auction): Promise<Auction> {
    if (!auction.isActive || auction.isFinished) {
        return auction;
    }
    try {
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
        return {
            ...auctionWithParams,
            secondsTillNextPriceDrop,
            approximateUnitPrice,
            totalPrice,
        };
    } catch (error) {
        return {
            ...auction,
            totalPrice: auction.collateralAmount.multipliedBy(auction.unitPrice),
        };
    }
};

export const enrichAuctionWithPriceDropAndMarketDataRecords = async function (
    auction: Auction,
    network: string,
    useAutoRouter?: boolean
): Promise<Auction> {
    const enrichedAuctionWithNewPriceDrop = await enrichAuctionWithPriceDrop(auction);
    const fees = await getApproximateTransactionFees(network);
    const auctionWithFees = await enrichAuctionWithTransactionFees(enrichedAuctionWithNewPriceDrop, fees, network);
    return await enrichAuctionWithMarketDataRecords(auctionWithFees, network, useAutoRouter);
};

export const fetchSingleAuctionById = async function (
    network: string,
    auctionId: string
): Promise<AuctionTransaction> {
    const { collateralType, index } = parseAuctionId(auctionId);
    const auction = await fetchAuctionByCollateralTypeAndAuctionIndex(network, collateralType, index);
    return enrichAuction(network, auction);
};

export const fetchAllInitialAuctions = async function (
    network: string,
    collateralTypes?: string[]
): Promise<AuctionInitialInfo[]> {
    if (!collateralTypes) {
        collateralTypes = await getSupportedCollateralTypes(network);
    }
    const auctionGroupsPromises = collateralTypes.map((collateralType: string) => {
        return fetchAuctionsByCollateralType(network, collateralType);
    });
    const auctionGroups = await Promise.all(auctionGroupsPromises);
    return auctionGroups.flat();
};

export const fetchAllAuctions = async function (network: string): Promise<AuctionTransaction[]> {
    const auctions = await fetchAllInitialAuctions(network);
    return await Promise.all(auctions.map(a => enrichAuction(network, a)));
};

export const enrichAuction = async function (
    network: string,
    auction: AuctionInitialInfo
): Promise<AuctionTransaction> {
    // enrich them with statuses
    const auctionWithStatus = await enrichAuctionWithActualNumbers(network, auction);

    // enrich them with price drop
    const auctionWithPriceDrop = await enrichAuctionWithPriceDrop(auctionWithStatus);

    // enrich with profit and fee calculation
    const fees = await getApproximateTransactionFees(network);
    const auctionWithFees = await enrichAuctionWithTransactionFees(auctionWithPriceDrop, fees, network);

    // enrich them with market data
    const auctionWithMarketDataRecords = await enrichAuctionWithMarketDataRecords(auctionWithFees, network);

    if (auction.debtDAI.isEqualTo(0)) {
        return {
            ...auctionWithMarketDataRecords,
            isFinished: true,
            isActive: false,
        };
    }
    return auctionWithMarketDataRecords;
};

const enrichTakeEventWithDate = async function (network: string, takeEvent: TakeEvent): Promise<TakeEvent> {
    const date = await fetchDateByBlockNumber(network, takeEvent.blockNumber);
    return {
        ...takeEvent,
        transactionDate: date,
    };
};

export const fetchTakeEvents = async function (network: string, auctionId: string): Promise<Array<TakeEvent>> {
    const { collateralType, index } = parseAuctionId(auctionId);
    const encodedAuctionIndex = convertNumberTo32Bytes(index);

    const contractName = getClipperNameByCollateralType(collateralType);
    const contract = await getContract(network, contractName);

    const eventFilters: EventFilter = contract.filters.Take(encodedAuctionIndex);
    const events = await contract.queryFilter(eventFilters);

    return await Promise.all(
        events.map(event =>
            enrichTakeEventWithDate(network, {
                transactionHash: event.transactionHash,
                blockNumber: event.blockNumber,
            })
        )
    );
};

export const restartAuction = async function (
    network: string,
    auction: Auction,
    profitAddress: string,
    notifier?: Notifier
): Promise<string> {
    const contractName = getClipperNameByCollateralType(auction.collateralType);
    return executeTransaction(network, contractName, 'redo', [auction.index, profitAddress], {
        notifier,
        confirmTransaction: false,
    });
};

export const bidWithDai = async function (
    network: string,
    auction: AuctionTransaction,
    bidAmountDai: BigNumber,
    profitAddress: string,
    notifier?: Notifier
): Promise<string> {
    const contractName = getClipperNameByCollateralType(auction.collateralType);
    const updatedAuction = await enrichAuctionWithActualNumbers(network, auction);
    const collateralAmount = calculateTransactionCollateralOutcome(bidAmountDai, updatedAuction.unitPrice, auction);
    const contractParameters = [
        convertNumberTo32Bytes(auction.index),
        collateralAmount.shiftedBy(WAD_NUMBER_OF_DIGITS).toFixed(0),
        updatedAuction.unitPrice.shiftedBy(RAY_NUMBER_OF_DIGITS).toFixed(0),
        profitAddress,
        NULL_BYTES,
    ];
    return executeTransaction(network, contractName, 'take', contractParameters, { notifier });
};

const buildGetCalleeDataParams = (marketData?: MarketData): GetCalleeDataParams | undefined => {
    const preloadedPools = marketData && 'pools' in marketData ? marketData.pools : undefined;
    const oneInchData = marketData && 'oneInch' in marketData ? marketData.oneInch : undefined;
    if (preloadedPools && oneInchData) {
        throw new Error('Cannot use both preloaded pools and oneInch data as params to get callee data');
    }
    if (preloadedPools) {
        return {
            pools: preloadedPools,
        };
    }
    if (oneInchData) {
        return { oneInchParams: { txData: oneInchData.calleeData, to: oneInchData.to } };
    }
    return undefined;
};
export const bidWithCallee = async function (
    network: string,
    auction: Auction,
    marketId: string,
    profitAddress: string,
    notifier?: Notifier
): Promise<string> {
    const calleeAddress = getCalleeAddressByCollateralType(network, auction.collateralType, marketId);
    const marketData = auction.marketDataRecords?.[marketId];
    const params = buildGetCalleeDataParams(marketData);
    const calleeData = await getCalleeData(network, auction.collateralType, marketId, profitAddress, params);
    const contractName = getClipperNameByCollateralType(auction.collateralType);
    const contractParameters = [
        convertNumberTo32Bytes(auction.index),
        auction.collateralAmount.shiftedBy(WAD_NUMBER_OF_DIGITS).toFixed(0),
        auction.unitPrice.shiftedBy(RAY_NUMBER_OF_DIGITS).toFixed(0),
        calleeAddress,
        calleeData,
    ];
    return executeTransaction(network, contractName, 'take', contractParameters, { notifier });
};

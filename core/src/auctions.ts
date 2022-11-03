import type { Auction, AuctionInitialInfo, AuctionTransaction, Notifier, TakeEvent } from './types';
import BigNumber from './bignumber';
import fetchAuctionsByCollateralType, {
    fetchAuctionByCollateralTypeAndAuctionIndex,
    fetchAuctionStatus,
    fetchMinimumBidDai,
} from './fetch';
import { getBestMarketId, getCalleeData, getMarketData, getMarketPrice } from './calleeFunctions';
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

export const enrichAuctionWithMarketData = async function (auction: Auction, network: string): Promise<Auction> {
    if (!auction.isActive || !auction.approximateUnitPrice || auction.isFinished) {
        return auction;
    }
    try {
        const collateralToCoverDebt = await calculateCollateralToCoverDebt(network, auction);
        let marketDataRecords = await getMarketData(network, auction.collateralSymbol, collateralToCoverDebt);
        const exchangeFees = await getDefaultMarketFee(network);
        const exchangeFeePerUnitDAI = exchangeFees.exchangeFeeDAI.dividedBy(collateralToCoverDebt);
        const currentDate = await getNetworkDate(auction.network);
        for (let marketData of Object.values(marketDataRecords)) {
            marketData = {
                ...marketData,
                marketUnitPrice: marketData.marketUnitPrice.plus(exchangeFeePerUnitDAI),
                marketUnitPriceToUnitPriceRatio: auction.approximateUnitPrice
                    .minus(marketData.marketUnitPrice)
                    .dividedBy(marketData.marketUnitPrice),
                ...exchangeFees,
                transactionGrossProfit: calculateTransactionGrossProfit(
                    marketData.marketUnitPrice,
                    collateralToCoverDebt,
                    auction.approximateUnitPrice
                ),
                transactionGrossProfitDate: calculateTransactionGrossProfitDate(
                    auction,
                    marketData.marketUnitPrice,
                    currentDate
                ),
            };
            marketDataRecords = { ...marketDataRecords, marketData };
        }
        const suggestedMarketId = await getBestMarketId(marketDataRecords);
        const marketUnitPrice = marketDataRecords[suggestedMarketId].marketUnitPrice;
        const marketUnitPriceToUnitPriceRatio = marketDataRecords[suggestedMarketId].marketUnitPriceToUnitPriceRatio;
        const transactionGrossProfit = marketDataRecords[suggestedMarketId].transactionGrossProfit;
        const transactionGrossProfitDate = marketDataRecords[suggestedMarketId].transactionGrossProfitDate;
        return {
            ...auction,
            suggestedMarketId,
            marketUnitPrice,
            marketUnitPriceToUnitPriceRatio,
            transactionGrossProfit,
            transactionGrossProfitDate,
            marketDataRecords,
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

export const enrichAuctionWithPriceDropAndMarketData = async function (
    auction: Auction,
    network: string
): Promise<Auction> {
    const enrichedAuctionWithNewPriceDrop = await enrichAuctionWithPriceDrop(auction);
    return await enrichAuctionWithMarketData(enrichedAuctionWithNewPriceDrop, network);
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

    // enrich them with market data
    const auctionWithMarketData = await enrichAuctionWithMarketData(auctionWithPriceDrop, network);

    // enrich with profit and fee calculation
    const fees = await getApproximateTransactionFees(network);
    const auctionWithFees = await enrichAuctionWithTransactionFees(auctionWithMarketData, fees, network);

    if (auction.debtDAI.isEqualTo(0)) {
        return {
            ...auctionWithFees,
            isFinished: true,
            isActive: false,
        };
    }
    return auctionWithFees;
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

export const bidWithCallee = async function (
    network: string,
    auction: Auction,
    marketId: string,
    profitAddress: string,
    notifier?: Notifier
): Promise<string> {
    const calleeAddress = getCalleeAddressByCollateralType(network, auction.collateralType, marketId);
    const calleeData = await getCalleeData(network, auction.collateralType, marketId, profitAddress);
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

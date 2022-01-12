import type { Auction, AuctionInitialInfo, Notifier } from './types';
import BigNumber from './bignumber';
import getMaker from './maker';
import COLLATERALS from './constants/COLLATERALS';
import { getExchangeRateBySymbol, getUniswapCalleeBySymbol, getUniswapParametersByCollateral } from './uniswap';
import { fetchCalcParametersByCollateralType } from './params';
import trackTransaction from './tracker';
import { RAD, RAY, RAY_NUMBER_OF_DIGITS, WAD, WAD_NUMBER_OF_DIGITS } from './constants/UNITS';
import { calculateAuctionDropTime, calculateAuctionPrice, calculateTransactionProfit } from './price';
import { getSupportedCollateralTypes } from './contracts';

const fetchAuctionsByType = async function (
    collateralType: string,
    maker: any,
    network: string
): Promise<AuctionInitialInfo[]> {
    const protoAuctions = await maker.service('liquidation').getAllClips(collateralType);
    const now = new Date();
    return protoAuctions.map((protoAuction: any): AuctionInitialInfo => {
        const isActive = protoAuction.active && protoAuction.endDate > now;
        return {
            network,
            id: `${protoAuction.ilk}:${protoAuction.saleId}`,
            auctionId: protoAuction.saleId,
            collateralType: protoAuction.ilk,
            collateralSymbol: COLLATERALS[protoAuction.ilk].symbol as string,
            collateralAmount: new BigNumber(protoAuction.lot),
            vaultAddress: protoAuction.usr,
            debtDAI: new BigNumber(protoAuction.tab),
            endDate: protoAuction.endDate,
            initialPrice: new BigNumber(protoAuction.top),
            startDate: protoAuction.created,
            isActive,
            isFinished: false,
            isRestarting: false,
        };
    });
};

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
    const maker = await getMaker(network);
    const collateralNames = await getSupportedCollateralTypes(network);

    // get all auctions
    const auctionGroupsPromises = collateralNames.map((collateralName: string) => {
        return fetchAuctionsByType(collateralName, maker, network);
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
    collateralType: string,
    id: number,
    profitAddress: string
): Promise<string> {
    const maker = await getMaker();
    const clipperContract = maker.service('liquidation')._clipperContractByIlk(collateralType);
    const transaction = clipperContract.redo(id, profitAddress);
    return transaction;
};

export const bidOnTheAuction = async function (
    network: string,
    auction: Auction,
    profitAddress: string,
    notifier?: Notifier
): Promise<string> {
    const maker = await getMaker();
    const calleeAddress = getUniswapCalleeBySymbol(network, auction.collateralSymbol);
    const flashData = await getUniswapParametersByCollateral(network, auction.collateralType, profitAddress);
    const transaction = maker
        .service('liquidation')
        .take(
            auction.collateralType,
            auction.auctionId,
            auction.collateralAmount.toFixed(WAD_NUMBER_OF_DIGITS),
            auction.unitPrice.toFixed(RAY_NUMBER_OF_DIGITS),
            calleeAddress,
            flashData
        );
    return trackTransaction(transaction, notifier);
};

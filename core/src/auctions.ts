import type { Auction, AuctionInitialInfo, Notifier } from './types';
import BigNumber from './bignumber';
import getMaker from './maker';
import COLLATERALS from './constants/COLLATERALS';
import { getExchangeRateBySymbol, getUniswapCalleeBySymbol, getUniswapParametersByCollateral } from './uniswap';
import { fetchCalcParametersByCollateralType } from './params';
import trackTransaction from './tracker';
import { RAD, RAY, RAY_NUMBER_OF_DIGITS, WAD, WAD_NUMBER_OF_DIGITS } from './constants/UNITS';
import { calculateAuctionDropTime, calculateAuctionPrice, calculateTransactionProfit } from './price';

const fetchAuctionsByType = async function (type: string, maker: any, network: string): Promise<AuctionInitialInfo[]> {
    const protoAuctions = await maker.service('liquidation').getAllClips(type);
    const now = new Date();
    const params = await fetchCalcParametersByCollateralType(network, type);

    return protoAuctions.map((protoAuction: any): AuctionInitialInfo => {
        const isActive = protoAuction.active && protoAuction.endDate > now;
        const collateralSymbol = COLLATERALS[protoAuction.ilk].symbol as string;
        const amountRAW = new BigNumber(protoAuction.lot);
        return {
            network,
            id: `${protoAuction.ilk}:${protoAuction.saleId}`,
            auctionId: protoAuction.saleId,
            collateralType: protoAuction.ilk,
            collateralSymbol,
            vaultOwner: protoAuction.usr,
            amountRAW,
            debtDAI: new BigNumber(protoAuction.tab),
            till: protoAuction.endDate,
            initialPrice: new BigNumber(protoAuction.top),
            start: protoAuction.created,
            isActive,
            isFinished: false,
            isRestarting: false,
            step: params.step,
            cut: params.cut,
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
            amountPerCollateral: new BigNumber(0),
            fetchedAmountPerCollateral: new BigNumber(0),
            amountDAI: new BigNumber(0),
        };
    }
    const status = await maker.service('liquidation').getStatus(auction.collateralType, auction.auctionId);
    const amountPerCollateral = new BigNumber(status.price).div(RAY);
    const amountRAW = new BigNumber(status.lot).div(WAD);

    return {
        ...auction,
        isActive: !status.needsRedo,
        debtDAI: new BigNumber(status.tab).div(RAD),
        amountRAW,
        amountPerCollateral,
        fetchedAmountPerCollateral: amountPerCollateral,
        amountDAI: amountRAW.multipliedBy(amountPerCollateral),
    };
};

const enrichAuctionWithMarketValues = async function (auction: Auction, network: string): Promise<Auction> {
    if (!auction.isActive) {
        return auction;
    }
    try {
        const marketPricePerCollateral = await getExchangeRateBySymbol(
            network,
            auction.collateralSymbol,
            auction.amountRAW
        );
        const marketValue = auction.amountPerCollateral
            .minus(marketPricePerCollateral)
            .dividedBy(marketPricePerCollateral);
        const auctionWithMarketValues = {
            ...auction,
            marketPricePerCollateral,
            marketValue,
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
    const currentDate = new Date();
    const secondsTillNextPriceDrop = calculateAuctionDropTime(auction, currentDate);
    const amountPerCollateral = calculateAuctionPrice(auction, currentDate);
    const amountDAI = auction.amountRAW.multipliedBy(amountPerCollateral);

    return {
        ...auction,
        secondsTillNextPriceDrop,
        amountPerCollateral,
        amountDAI,
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
    const collateralNames = Object.keys(COLLATERALS);

    // get all auctions
    const auctionGroupsPromises = collateralNames.map((collateralName: string) => {
        // hack to get over invalid token addresses hardcoded in dai.js mcd plugin
        // https://github.com/makerdao/dai.js/blob/dev/packages/dai-plugin-mcd/contracts/addresses/kovan.json#L153-L201
        // TODO: remove this as soon as we fetch addresses ourselves
        if (network === 'kovan' && collateralName.startsWith('UNIV2') && collateralName !== 'UNIV2DAIETH-A') {
            return [];
        }
        return fetchAuctionsByType(collateralName, maker, network);
    });
    const auctionGroups = await Promise.all(auctionGroupsPromises);
    const auctions = auctionGroups.flat();
    return auctions;
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
            auction.amountRAW.toFixed(WAD_NUMBER_OF_DIGITS),
            auction.fetchedAmountPerCollateral.toFixed(RAY_NUMBER_OF_DIGITS),
            calleeAddress,
            flashData
        );
    return trackTransaction(transaction, notifier);
};

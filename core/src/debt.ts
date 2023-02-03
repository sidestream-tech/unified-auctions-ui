import type { DebtAuctionActive, DebtAuctionTransaction } from './types';
import BigNumber from './bignumber';
import getContract from './contracts';
import { RAD_NUMBER_OF_DIGITS, WAD_NUMBER_OF_DIGITS } from './constants/UNITS';
import { Contract } from 'ethers';
import { MKR_NUMBER_OF_DIGITS, WAD, RAD } from './constants/UNITS';
import memoizee from 'memoizee';
import getNetworkDate from './date';
import { CompensationAuctionBase, DebtAuction, Notifier, CompensationAuctionTransactionFees } from './types';
import { getEarliestDate } from './helpers/getEarliestDate';
import executeTransaction from './execute';
import { convertDaiToMkr } from './calleeFunctions/helpers/uniswapV3';
import { getGasPriceForUI } from './gas';
import { getMarketPrice } from './calleeFunctions';

const CONTRACT = 'MCD_FLOP';

export const getNextMaximumMkrReceived = async (
    network: string,
    debtAuction: DebtAuctionActive
): Promise<BigNumber> => {
    const decreaseCoefficient = await getDebtAuctionBidDecreaseCoefficient(network);
    return new BigNumber(
        debtAuction.receiveAmountMKR
            .dividedBy(decreaseCoefficient)
            .toPrecision(MKR_NUMBER_OF_DIGITS - 1, BigNumber.ROUND_FLOOR)
    );
};

export const fetchActiveDebtAuctions = async function (network: string): Promise<DebtAuctionActive[]> {
    const contract = await getContract(network, CONTRACT);
    const auctionLastIndex = await getDebtAuctionLastIndex(contract);

    const debtAuctions: DebtAuctionActive[] = [];
    for (let i = auctionLastIndex; i > 0; i--) {
        const currentAuction = await getActiveDebtAuctionOrUndefined(network, i);
        if (!currentAuction) {
            break;
        }
        debtAuctions.push(currentAuction as DebtAuctionActive);
    }
    return debtAuctions;
};

export const restartDebtAuction = async function (
    network: string,
    auctionIndex: number,
    notifier?: Notifier
): Promise<void> {
    await executeTransaction(network, CONTRACT, 'tick', [auctionIndex], { notifier });
};

export const bidToDebtAuction = async function (
    network: string,
    auctionIndex: number,
    acceptableReceivedAmount: BigNumber,
    notifier?: Notifier
) {
    const auction = (await getActiveDebtAuctionOrUndefined(network, auctionIndex)) as DebtAuctionActive | undefined;
    if (!auction || !auction.receiveAmountMKR) {
        throw new Error('Did not find the auction to bid on.');
    }
    const transactionParameters = [
        auctionIndex,
        acceptableReceivedAmount.shiftedBy(WAD_NUMBER_OF_DIGITS).toFixed(0),
        auction.bidAmountDai.shiftedBy(RAD_NUMBER_OF_DIGITS).toFixed(0),
    ];
    await executeTransaction(network, CONTRACT, 'dent', transactionParameters, { notifier });
};
export const collectDebtAuction = async (network: string, auctionIndex: number, notifier?: Notifier) => {
    const auction = await getActiveDebtAuctionOrUndefined(network, auctionIndex);
    if (!auction || auction.state !== 'ready-for-collection') {
        throw new Error('Did not find the auction to collect.');
    }
    await executeTransaction(network, CONTRACT, 'deal', [auctionIndex], { notifier });
};
export const enrichDebtAuction = async (
    network: string,
    auction: DebtAuctionActive
): Promise<DebtAuctionTransaction> => {
    const nextMaximumLotReceived = await getNextMaximumMkrReceived(network, auction);
    const unitPrice = auction.bidAmountDai.div(auction.receiveAmountMKR);
    const marketUnitPrice = await getMarketPriceDaiToMkr(network, auction.receiveAmountMKR);
    const marketUnitPriceToUnitPriceRatio = unitPrice.minus(marketUnitPrice).dividedBy(marketUnitPrice);
    const fees = await getDebtAuctionTransactionFees(network);
    return {
        ...auction,
        ...fees,
        nextMaximumLotReceived,
        unitPrice,
        marketUnitPrice,
        marketUnitPriceToUnitPriceRatio,
    };
};

export const enrichDebtAuctions = async (network: string, auctions: DebtAuction[]): Promise<DebtAuction[]> => {
    const auctionsWithNextMinimumBidsPromises = auctions.map(auction => {
        if (auction.state === 'collected') {
            return auction;
        }
        return enrichDebtAuction(network, auction);
    });
    return await Promise.all(auctionsWithNextMinimumBidsPromises as Promise<DebtAuctionTransaction>[]);
};

export const getDebtAuctionLastIndex = async (contract: Contract): Promise<number> => {
    const auctionsQuantityBinary = await contract.kicks();
    return new BigNumber(auctionsQuantityBinary._hex).toNumber();
};

const _getDebtAuctionBidDecreaseCoefficient = async (network: string): Promise<BigNumber> => {
    const contract = await getContract(network, CONTRACT);
    const auctionsQuantityBinary = await contract.beg();
    return new BigNumber(auctionsQuantityBinary._hex).shiftedBy(-MKR_NUMBER_OF_DIGITS);
};

export const getDebtAuctionBidDecreaseCoefficient = memoizee(_getDebtAuctionBidDecreaseCoefficient, {
    promise: true,
    length: 3,
});

const getDebtAuctionState = async (network: string, earliestEndDate: Date, greatestBid: number) => {
    const isBidExpired = (await getNetworkDate(network)) > earliestEndDate;
    const haveBids = greatestBid !== 0;
    if (haveBids) {
        if (isBidExpired) {
            return 'ready-for-collection';
        }
        return 'have-bids';
    }
    if (isBidExpired) {
        return 'requires-restart';
    }
    return 'just-started';
};

const _getContractAuctionDuration = async (network: string) => {
    const contract = await getContract(network, CONTRACT);
    return await contract.tau();
};
const getDebtContractAuctionDuration = memoizee(_getContractAuctionDuration, {
    maxAge: 24 * 60 * 60 * 1000,
    promise: true,
    length: 1,
});

export const fetchDebtAuctionByIndex = async (network: string, auctionIndex: number): Promise<DebtAuction> => {
    const contract = await getContract(network, CONTRACT);
    const auctionData = await contract.bids(auctionIndex);
    const isAuctionCollected = new BigNumber(auctionData.end).eq(0);
    const auctionDuration = await getDebtContractAuctionDuration(network);
    const fetchedAt = new Date();
    const baseAuctionInfo: CompensationAuctionBase = {
        network,
        id: auctionIndex,
        fetchedAt,
    };

    if (isAuctionCollected) {
        const auctionLastIndex = await getDebtAuctionLastIndex(contract);
        if (auctionLastIndex < auctionIndex) {
            throw new Error('No active auction exists with this id');
        }
        return { ...baseAuctionInfo, state: 'collected' };
    }

    const auctionEndDate = new Date(auctionData.end * 1000);
    const auctionStartDate = new Date(auctionEndDate.getTime() - auctionDuration * 1000);
    const bidEndDate = auctionData.tic ? new Date(auctionData.tic * 1000) : undefined;
    const earliestEndDate = bidEndDate ? getEarliestDate(auctionEndDate, bidEndDate) : auctionEndDate;
    const state = await getDebtAuctionState(network, earliestEndDate, auctionData.tic);

    return {
        ...baseAuctionInfo,
        earliestEndDate,
        bidAmountDai: new BigNumber(auctionData.bid._hex).div(RAD),
        receiveAmountMKR: new BigNumber(auctionData.lot._hex).div(WAD),
        receiverAddress: auctionData.guy,
        auctionEndDate,
        bidEndDate,
        state,
        fetchedAt,
        auctionStartDate,
    };
};

export const getActiveDebtAuctionOrUndefined = async (
    network: string,
    auctionIndex: number
): Promise<DebtAuctionActive | undefined> => {
    const auction = await fetchDebtAuctionByIndex(network, auctionIndex);
    if (auction.state === 'collected') {
        return;
    }
    return auction as DebtAuctionActive;
};

export const getMarketPriceDaiToMkr = async function (network: string, mkrAmount: BigNumber): Promise<BigNumber> {
    try {
        return new BigNumber(1).div((await convertDaiToMkr(network, mkrAmount)).div(mkrAmount));
    } catch (error) {
        return new BigNumber(NaN);
    }
};

export const getDebtAuctionTransactionFees = async function (
    network: string
): Promise<CompensationAuctionTransactionFees> {
    const gasPrice = await getGasPriceForUI(network);
    const exchangeRate = await getMarketPrice(network, 'ETH');

    // TODO: Adjust the gas prices when the simulation is available.
    const restartTransactionFeeEth = gasPrice.multipliedBy(80563);
    const allowanceTransactionFeeEth = gasPrice.multipliedBy(48373);
    const bidTransactionFeeEth = gasPrice.multipliedBy(85181);
    const collectTransactionFeeEth = gasPrice.multipliedBy(94114);
    const authTransactionFeeEth = gasPrice.multipliedBy(48356);
    const combinedBidFeesEth = bidTransactionFeeEth.plus(collectTransactionFeeEth);

    return {
        restartTransactionFeeEth,
        restartTransactionFeeDai: restartTransactionFeeEth.multipliedBy(exchangeRate),
        allowanceTransactionFeeEth,
        allowanceTransactionFeeDai: allowanceTransactionFeeEth.multipliedBy(exchangeRate),
        bidTransactionFeeEth,
        bidTransactionFeeDai: bidTransactionFeeEth.multipliedBy(exchangeRate),
        collectTransactionFeeEth,
        collectTransactionFeeDai: collectTransactionFeeEth.multipliedBy(exchangeRate),
        authTransactionFeeEth,
        authTransactionFeeDai: authTransactionFeeEth.multipliedBy(exchangeRate),
        combinedBidFeesEth,
        combinedBidFeesDai: combinedBidFeesEth.multipliedBy(exchangeRate),
    };
};

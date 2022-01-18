import type { Auction, AuctionTransaction, TransactionFees } from './types';
import BigNumber from './bignumber';
import { getExchangeRateBySymbol } from './uniswap';
import { getNetworkConfigByType } from './constants/NETWORKS';
import { ETH_NUMBER_OF_DIGITS } from './constants/UNITS';
import { getCurrentGasPrice } from './gas';

export const getGasPrice = async function (network: string): Promise<BigNumber | undefined> {
    const networkConfig = getNetworkConfigByType(network);
    if (networkConfig.gasPrice) {
        return new BigNumber(networkConfig.gasPrice).shiftedBy(-ETH_NUMBER_OF_DIGITS);
    }
    try {
        return await getCurrentGasPrice();
    } catch (error) {
        console.warn('Gas data is not available', error);
    }
};

export const getApproximateTransactionFees = async function (network: string): Promise<TransactionFees | undefined> {
    const gasPrice = await getGasPrice(network);
    if (!gasPrice) {
        return;
    }
    const exchangeRate = await getExchangeRateBySymbol(network, 'ETH');
    const convertETHtoDAI = function (eth: BigNumber) {
        return eth.multipliedBy(exchangeRate);
    };
    // TODO: figure out a way to properly estimate gas
    // for each transaction when no wallet is connected
    const biddingTransactionFeeETH = gasPrice.multipliedBy(647053);
    const authTransactionFeeETH = gasPrice.multipliedBy(74951);
    const restartTransactionFeeETH = gasPrice.multipliedBy(209182);
    return {
        biddingTransactionFeeETH,
        biddingTransactionFeeDAI: convertETHtoDAI(biddingTransactionFeeETH),
        authTransactionFeeETH,
        authTransactionFeeDAI: convertETHtoDAI(authTransactionFeeETH),
        restartTransactionFeeETH,
    };
};

export const enrichAuctionWithTransactionFees = function (
    auction: Auction,
    fees: TransactionFees
): AuctionTransaction {
    const auctionTransaction = {
        ...auction,
        ...fees,
    } as AuctionTransaction;
    if (auction.transactionProfit && fees.biddingTransactionFeeDAI) {
        auctionTransaction.transactionProfitMinusFees = auction.transactionProfit.minus(fees.biddingTransactionFeeDAI);
    }
    return auctionTransaction;
};

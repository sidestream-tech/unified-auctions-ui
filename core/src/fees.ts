import type { Auction, AuctionTransaction, TransactionFees } from './types';
import BigNumber from './bignumber';
import { getExchangeRateBySymbol } from './uniswap';
import { getGasPrice } from './gas';
import memoizee from 'memoizee';

const TRANSACTION_FEE_CACHE = 30 * 1000;

const _getApproximateTransactionFees = async function (network: string): Promise<TransactionFees> {
    const gasPrice = await getGasPrice(network);
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

export const getApproximateTransactionFees = memoizee(_getApproximateTransactionFees, {
    maxAge: TRANSACTION_FEE_CACHE,
    promise: true,
    length: 1,
});

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

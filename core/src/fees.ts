import type { Auction, AuctionTransaction, TransactionFees } from './types';
import BigNumber from './bignumber';
import { getMarketPrice } from './calleeFunctions';
import { getGasPrice } from './gas';

export const getApproximateTransactionFees = async function (network: string): Promise<TransactionFees> {
    const gasPrice = await getGasPrice(network);
    const exchangeRate = await getMarketPrice(network, 'ETH');
    const convertETHtoDAI = function (eth: BigNumber) {
        return eth.multipliedBy(exchangeRate);
    };
    // TODO: figure out a way to properly estimate gas
    // for each transaction when no wallet is connected
    const biddingTransactionFeeETH = gasPrice.multipliedBy(647053);
    const authTransactionFeeETH = gasPrice.multipliedBy(74951);
    const restartTransactionFeeETH = gasPrice.multipliedBy(209182);

    /* 
        To get total we have to check if the 2 auth steps were executed (memoizze the function that retrieves this)
        It then adds the bidding and 2x auth fees together

        Get Wallet Address and Collateral Type to see if authorization was already conducted.
    */
    return {
        biddingTransactionFeeETH,
        biddingTransactionFeeDAI: convertETHtoDAI(biddingTransactionFeeETH),
        authTransactionFeeETH,
        authTransactionFeeDAI: convertETHtoDAI(authTransactionFeeETH),
        restartTransactionFeeETH,
        totalFeeETH: new BigNumber(0),
        totalFeeDAI: new BigNumber(0),
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
        auctionTransaction.transactionProfitMinusFees = auction.transactionProfit.minus(fees.totalFeeDAI);
    }
    return auctionTransaction;
};

import type { Auction, AuctionTransaction, TransactionFees } from './types';
import BigNumber from './bignumber';
import { getMarketPrice } from './calleeFunctions';
import { getGasPrice } from './gas';
import getSigner from './signer';
import { getCollateralAuthorizationStatus, getWalletAuthorizationStatus } from './authorizations';

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

    return {
        biddingTransactionFeeETH,
        biddingTransactionFeeDAI: convertETHtoDAI(biddingTransactionFeeETH),
        authTransactionFeeETH,
        authTransactionFeeDAI: convertETHtoDAI(authTransactionFeeETH),
        restartTransactionFeeETH,
    };
};

export const enrichAuctionWithTransactionFees = async function (
    auction: Auction,
    fees: TransactionFees,
    network: string
): Promise<AuctionTransaction> {
    let totalFeeETH = new BigNumber(0);
    let totalFeeDAI = new BigNumber(0);

    try {
        const signer = await getSigner(network);
        const address = await signer.getAddress();
        const isWalletAuthed = await getWalletAuthorizationStatus(network, address);
        const isCollateralAuthed = await getCollateralAuthorizationStatus(network, auction.collateralType, address);

        if (!isWalletAuthed) {
            console.info(`AuthFee: ${fees.authTransactionFeeDAI.toNumber()}`);
            totalFeeETH = totalFeeETH.plus(fees.authTransactionFeeETH);
            totalFeeDAI = totalFeeDAI.plus(fees.authTransactionFeeDAI);
        }
        if (!isCollateralAuthed) {
            console.info(`BidFee: ${fees.biddingTransactionFeeETH.toNumber()}`);
            totalFeeETH = totalFeeETH.plus(fees.biddingTransactionFeeETH);
            totalFeeDAI = totalFeeDAI.plus(fees.biddingTransactionFeeETH);
        }
    } catch (e) {
        console.error(e);
        totalFeeETH = totalFeeETH.plus(fees.authTransactionFeeETH).plus(fees.biddingTransactionFeeETH);
        totalFeeDAI = totalFeeDAI.plus(fees.authTransactionFeeDAI).plus(fees.authTransactionFeeDAI);
    }

    const auctionTransaction = {
        ...auction,
        ...fees,
        totalFeeETH: totalFeeETH,
        totalFeeDAI: totalFeeDAI,
    } as AuctionTransaction;
    if (auction.transactionProfit && fees.biddingTransactionFeeDAI) {
        auctionTransaction.transactionProfitMinusFees = auction.transactionProfit.minus(totalFeeDAI);
    }
    return auctionTransaction;
};

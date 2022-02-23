import type { Auction, AuctionTransaction, TransactionFees } from './types';
import BigNumber from './bignumber';
import { getMarketPrice } from './calleeFunctions';
import { getGasPrice } from './gas';
import getSigner from './signer';
import { getCollateralAuthorizationStatus, getWalletAuthorizationStatus } from './authorizations';

export const convertETHtoDAI = async function (network: string, eth: BigNumber): Promise<BigNumber> {
    const exchangeRate = await getMarketPrice(network, 'ETH');
    return eth.multipliedBy(exchangeRate);
};

export const getApproximateTransactionFees = async function (network: string): Promise<TransactionFees> {
    const gasPrice = await getGasPrice(network);

    // TODO: figure out a way to properly estimate gas
    // for each transaction when no wallet is connected
    const biddingTransactionFeeETH = gasPrice.multipliedBy(647053);
    const authTransactionFeeETH = gasPrice.multipliedBy(74951);
    const restartTransactionFeeETH = gasPrice.multipliedBy(209182);

    return {
        biddingTransactionFeeETH,
        biddingTransactionFeeDAI: await convertETHtoDAI(network, biddingTransactionFeeETH),
        authTransactionFeeETH,
        authTransactionFeeDAI: await convertETHtoDAI(network, authTransactionFeeETH),
        restartTransactionFeeETH,
    };
};

export const enrichAuctionWithTransactionFees = async function (
    auction: Auction,
    fees: TransactionFees,
    network: string
): Promise<AuctionTransaction> {
    let totalFeeETH = fees.biddingTransactionFeeETH;

    try {
        const signer = await getSigner(network);
        const address = await signer.getAddress();
        const isWalletAuthed = await getWalletAuthorizationStatus(network, address);
        const isCollateralAuthed = await getCollateralAuthorizationStatus(network, auction.collateralType, address);

        if (!isWalletAuthed) {
            totalFeeETH = totalFeeETH.plus(fees.authTransactionFeeETH);
        }
        if (!isCollateralAuthed) {
            totalFeeETH = totalFeeETH.plus(fees.authTransactionFeeETH);
        }
    } catch (e) {
        totalFeeETH = totalFeeETH.plus(fees.authTransactionFeeETH).plus(fees.authTransactionFeeETH);
    }

    const totalFeeDAI = await convertETHtoDAI(network, totalFeeETH);
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

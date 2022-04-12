import type { Auction, AuctionTransaction, TransactionFees } from './types';
import BigNumber from './bignumber';
import { getMarketPrice } from './calleeFunctions';
import { getGasPriceForUI } from './gas';
import getSigner from './signer';
import { getCollateralAuthorizationStatus, getWalletAuthorizationStatus } from './authorizations';

export const convertETHtoDAI = async function (network: string, eth: BigNumber): Promise<BigNumber> {
    const exchangeRate = await getMarketPrice(network, 'ETH');
    return eth.multipliedBy(exchangeRate);
};

export const getApproximateTransactionFees = async function (network: string): Promise<TransactionFees> {
    const gasPrice = await getGasPriceForUI(network);

    // TODO: figure out a way to properly estimate gas
    // for each transaction when no wallet is connected
    const biddingTransactionFeeETH = gasPrice.multipliedBy(722651);
    const authTransactionFeeETH = gasPrice.multipliedBy(48356);
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
        const walletAddress = await signer.getAddress();
        const isWalletAuthed = await getWalletAuthorizationStatus(network, walletAddress);
        const isCollateralAuthed = await getCollateralAuthorizationStatus(
            network,
            auction.collateralType,
            walletAddress
        );

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
    if (auction.transactionGrossProfit && fees.biddingTransactionFeeDAI) {
        auctionTransaction.transactionNetProfit = auction.transactionGrossProfit.minus(totalFeeDAI);
    }
    return auctionTransaction;
};

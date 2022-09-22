import type { Auction, AuctionTransaction, TransactionFees, VaultTransactionFees } from './types';
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
    const bidTransactionFeeETH = gasPrice.multipliedBy(145438);
    const swapTransactionFeeETH = gasPrice.multipliedBy(722651);
    const authTransactionFeeETH = gasPrice.multipliedBy(48356);
    const restartTransactionFeeETH = gasPrice.multipliedBy(209182);

    return {
        bidTransactionFeeETH,
        bidTransactionFeeDAI: await convertETHtoDAI(network, bidTransactionFeeETH),
        swapTransactionFeeETH,
        swapTransactionFeeDAI: await convertETHtoDAI(network, swapTransactionFeeETH),
        authTransactionFeeETH,
        authTransactionFeeDAI: await convertETHtoDAI(network, authTransactionFeeETH),
        restartTransactionFeeETH,
        restartTransactionFeeDAI: await convertETHtoDAI(network, restartTransactionFeeETH),
    };
};

export const getApproximateLiquidationFees = async function (network: string): Promise<VaultTransactionFees> {
    const gasPrice = await getGasPriceForUI(network);
    const transactionFeeLiquidationEth = gasPrice.multipliedBy(446658);
    return {
        transactionFeeLiquidationEth,
        transactionFeeLiquidationDai: await convertETHtoDAI(network, transactionFeeLiquidationEth),
    };
};

export const enrichAuctionWithTransactionFees = async function (
    auction: Auction,
    fees: TransactionFees,
    network: string
): Promise<AuctionTransaction> {
    let combinedSwapFeesETH = fees.swapTransactionFeeETH;
    let combinedBidFeesETH = fees.bidTransactionFeeETH;

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
            combinedSwapFeesETH = combinedSwapFeesETH.plus(fees.authTransactionFeeETH);
            combinedBidFeesETH = combinedBidFeesETH.plus(fees.authTransactionFeeETH);
        }
        if (!isCollateralAuthed) {
            combinedSwapFeesETH = combinedSwapFeesETH.plus(fees.authTransactionFeeETH);
            combinedBidFeesETH = combinedSwapFeesETH.plus(fees.authTransactionFeeETH);
        }
    } catch (e) {
        combinedSwapFeesETH = combinedSwapFeesETH.plus(fees.authTransactionFeeETH).plus(fees.authTransactionFeeETH);
        combinedBidFeesETH = combinedBidFeesETH.plus(fees.authTransactionFeeETH).plus(fees.authTransactionFeeETH);
    }

    const combinedSwapFeesDAI = await convertETHtoDAI(network, combinedSwapFeesETH);
    const combinedBidFeesDAI = await convertETHtoDAI(network, combinedBidFeesETH);
    const auctionTransaction = {
        ...auction,
        ...fees,
        combinedBidFeesETH: combinedBidFeesETH,
        combinedBidFeesDAI: combinedBidFeesDAI,
        combinedSwapFeesETH: combinedSwapFeesETH,
        combinedSwapFeesDAI: combinedSwapFeesDAI,
    } as AuctionTransaction;
    if (auction.transactionGrossProfit && fees.swapTransactionFeeDAI) {
        auctionTransaction.transactionNetProfit = auction.transactionGrossProfit.minus(combinedSwapFeesDAI);
    }
    return auctionTransaction;
};

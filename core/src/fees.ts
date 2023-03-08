import type { Auction, AuctionTransaction, TransactionFees, VaultTransactionFees, ExchangeFees } from './types';
import BigNumber from './bignumber';
import { getGasPriceForUI } from './gas';
import getSigner from './signer';
import { getCollateralAuthorizationStatus, getWalletAuthorizationStatus } from './authorizations';
import { convertSymbolToDai } from './calleeFunctions/helpers/uniswapV3';
import { ETH_NUMBER_OF_DIGITS } from './constants/UNITS';

export const BID_TRANSACTION_GAS_LIMIT = 145438;
export const SWAP_TRANSACTION_GAS_LIMIT = 722651;
export const AUTH_TRANSACTION_GAS_LIMIT = 48356;
export const RESTART_TRANSACTION_GAS_LIMIT = 209182;
export const LIQUIDATION_TRANSACTION_GAS_LIMIT = 446658;

export const convertETHtoDAI = async function (network: string, eth: BigNumber): Promise<BigNumber> {
    const exchangeRate = await convertSymbolToDai(network, 'ETH', new BigNumber(1), ETH_NUMBER_OF_DIGITS);
    return eth.multipliedBy(exchangeRate);
};

export const getApproximateTransactionFees = async function (network: string): Promise<TransactionFees> {
    const gasPrice = await getGasPriceForUI(network);

    // TODO: figure out a way to properly estimate gas
    // for each transaction when no wallet is connected
    const bidTransactionFeeETH = gasPrice.multipliedBy(BID_TRANSACTION_GAS_LIMIT);
    const swapTransactionFeeETH = gasPrice.multipliedBy(SWAP_TRANSACTION_GAS_LIMIT);
    const authTransactionFeeETH = gasPrice.multipliedBy(AUTH_TRANSACTION_GAS_LIMIT);
    const restartTransactionFeeETH = gasPrice.multipliedBy(RESTART_TRANSACTION_GAS_LIMIT);

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

export const getDefaultMarketFee = async function (network: string): Promise<ExchangeFees> {
    const gasPrice = await getGasPriceForUI(network);
    const exchangeFeeETH = gasPrice.multipliedBy(SWAP_TRANSACTION_GAS_LIMIT - BID_TRANSACTION_GAS_LIMIT);
    return {
        exchangeFeeETH,
        exchangeFeeDAI: await convertETHtoDAI(network, exchangeFeeETH),
    };
};

export const getApproximateLiquidationFees = async function (network: string): Promise<VaultTransactionFees> {
    const gasPrice = await getGasPriceForUI(network);
    const transactionFeeLiquidationEth = gasPrice.multipliedBy(LIQUIDATION_TRANSACTION_GAS_LIMIT);
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

    return auctionTransaction;
};

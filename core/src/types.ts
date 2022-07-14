import BigNumber from 'bignumber.js';

export declare interface GasParameters {
    maxFeePerGas?: string;
    maxPriorityFeePerGas?: string;
    gasPrice?: string;
}

export declare interface AuctionInitialInfo {
    network: string;
    id: string;
    index: number;
    collateralType: string;
    collateralSymbol: string;
    collateralAmount: BigNumber;
    debtDAI: BigNumber;
    startDate: Date;
    endDate: Date;
    vaultAddress: string;
    isActive: boolean;
    isFinished: boolean;
    isRestarting: boolean;
    marketUnitPrice?: BigNumber;
    marketUnitPriceToUnitPriceRatio?: BigNumber;
    transactionGrossProfit?: BigNumber;
    transactionAddress?: string;
    initialPrice: BigNumber;
    fetchedAt: Date;
}

export declare interface AuctionStatus {
    isActive: boolean;
    debtDAI: BigNumber;
    collateralAmount: BigNumber;
    unitPrice: BigNumber;
    totalPrice: BigNumber;
}

export declare interface Auction extends AuctionInitialInfo {
    unitPrice: BigNumber;
    totalPrice: BigNumber;
    approximateUnitPrice: BigNumber;
    secondsBetweenPriceDrops?: number;
    secondsTillNextPriceDrop?: number;
    priceDropRatio?: BigNumber;
    transactionGrossProfitDate?: Date;
    minimumBidDai: BigNumber;
}

export declare interface TransactionFees {
    bidTransactionFeeETH: BigNumber;
    bidTransactionFeeDAI: BigNumber;
    swapTransactionFeeETH: BigNumber;
    swapTransactionFeeDAI: BigNumber;
    authTransactionFeeETH: BigNumber;
    authTransactionFeeDAI: BigNumber;
    restartTransactionFeeETH: BigNumber;
    restartTransactionFeeDAI: BigNumber;
}

export declare interface CollateralRow extends CollateralConfig, Partial<MakerParams> {
    marketUnitPrice?: BigNumber | string;
    tokenAddress?: string;
    tokenAddressError?: string;
}

export declare interface AuctionTransaction extends Auction, TransactionFees {
    transactionNetProfit: BigNumber;
    combinedBidFeesDAI: BigNumber;
    combinedBidFeesETH: BigNumber;
    combinedSwapFeesDAI: BigNumber;
    combinedSwapFeesETH: BigNumber;
}

export declare interface RegularCalleeConfig {
    callee: 'UniswapV2CalleeDai' | 'WstETHCurveUniv3Callee' | 'CurveLpTokenUniv3Callee' | 'UniswapV3Callee';
    route: string[];
}

export declare interface UniswapV2LpTokenCalleeConfig {
    callee: 'UniswapV2LpTokenCalleeDai';
    token0: string;
    token1: string;
}

export declare interface CollateralConfig {
    title: string;
    ilk: string;
    symbol: string;
    decimals: number;
    exchange: RegularCalleeConfig | UniswapV2LpTokenCalleeConfig;
}

export declare interface NetworkConfig {
    chainId: string;
    type: string;
    title: string;
    url: string;
    gasPrice?: number;
    etherscanUrl: string;
    isFork: boolean;
}

export declare interface CalleeAddresses {
    UniswapV2CalleeDai: string;
    UniswapV2LpTokenCalleeDai: string;
    WstETHCurveUniv3Callee?: string;
    CurveLpTokenUniv3Callee?: string;
    UniswapV3Callee?: string;
}

export type CalleeNames = keyof CalleeAddresses;

export declare interface CalleeFunctions {
    getCalleeData: (network: string, collateral: CollateralConfig, profitAddress: string) => Promise<string>;
    getMarketPrice: (network: string, collateral: CollateralConfig, amount: BigNumber) => Promise<BigNumber>;
}

export declare interface MakerParams {
    secondsBetweenPriceDrops: number;
    priceDropRatio: BigNumber;
}

export declare interface MessageContent {
    key: string;
    content: string;
    duration: number;
}

export declare interface Notifier {
    (messageType: 'loading' | 'error' | 'success' | 'info', messageContent: MessageContent): void;
}

export declare interface TakeEvent {
    transactionHash: string;
    blockNumber: number;
    transactionDate?: Date;
}

export declare interface WalletBalances {
    walletETH: BigNumber;
    walletDAI: BigNumber;
    walletMKR: BigNumber;
    walletVatDAI: BigNumber;
    walletLastUpdatedDate: Date;
}

export declare interface CollateralStatus {
    type: string;
    symbol: string;
    isAuthorized: boolean;
    isAuthorizing: boolean;
    isDepositingOrWithdrawing: boolean;
    address?: string | null;
    balance?: BigNumber;
}

export declare interface SurplusAuctionBase {
    id: number;
    network: string;
    fetchedAt: Date;
}

export declare interface SurplusAuctionActive extends SurplusAuctionBase {
    bidAmountMKR: BigNumber;
    receiveAmountDAI: BigNumber;
    receiverAddress: string;
    auctionEndDate: Date;
    bidEndDate?: Date;
    earliestEndDate: Date;
    state: 'just-started' | 'have-bids' | 'ready-for-collection' | 'requires-restart';
}

export declare interface SurplusAuctionCollected extends SurplusAuctionBase {
    state: 'collected';
}

export type SurplusAuction = SurplusAuctionActive | SurplusAuctionCollected;

export type SurplusAuctionStates = SurplusAuction['state'];

export declare interface SurplusTransactionFees {
    bidTransactionFee: BigNumber;
    authTransactionFeeDAI: BigNumber;
    restartTransactionFee: BigNumber;
    collectTransactionFee: BigNumber;
}

export declare interface SurplusAuctionEnriched extends SurplusAuctionActive {
    nextMinimumBid?: BigNumber;
    marketUnitPrice?: BigNumber | string;
    marketUnitPriceToUnitPriceRatio?: BigNumber;
    unitPrice?: BigNumber;
}

export declare interface SurplusAuctionTransaction extends SurplusAuctionEnriched, SurplusTransactionFees {
    combinedBidFees: BigNumber;
}

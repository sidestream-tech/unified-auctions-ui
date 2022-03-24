import BigNumber from 'bignumber.js';

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
    biddingTransactionFeeETH: BigNumber;
    biddingTransactionFeeDAI: BigNumber;
    authTransactionFeeETH: BigNumber;
    authTransactionFeeDAI: BigNumber;
    restartTransactionFeeETH: BigNumber;
}

export declare interface CollateralRow extends CollateralConfig, Partial<MakerParams> {
    marketUnitPrice?: BigNumber | string;
    tokenAddress?: string;
    tokenAddressError?: string;
}

export declare interface AuctionTransaction extends Auction, TransactionFees {
    transactionNetProfit: BigNumber;
    totalFeeDAI: BigNumber;
    totalFeeETH: BigNumber;
}

export declare interface UniswapV2CalleeConfig {
    callee: 'UniswapV2CalleeDai' | 'WstETHCurveUniv3Callee';
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
    exchange: UniswapV2CalleeConfig | UniswapV2LpTokenCalleeConfig;
}

export declare interface NetworkConfig {
    chainId: string;
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
    walletVatDAI: BigNumber;
    walletLastUpdatedDate: Date;
}

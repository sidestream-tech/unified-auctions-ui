import BigNumber from 'bignumber.js';

export declare interface AuctionInitialInfo {
    network: string;
    id: string;
    auctionId: number;
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
    transactionProfit?: BigNumber;
    transactionAddress?: string;
    initialPrice: BigNumber;
}

export declare interface Auction extends AuctionInitialInfo {
    unitPrice: BigNumber;
    totalPrice: BigNumber;
    approximateUnitPrice: BigNumber;
    secondsBetweenPriceDrops?: number;
    secondsTillNextPriceDrop?: number;
    priceDropRatio?: BigNumber;
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
    isOnChain?: boolean;
}

export declare interface AuctionTransaction extends Auction, TransactionFees {
    transactionProfitMinusFees: BigNumber;
}

export declare interface UniswapTokenConfig {
    type: 'token';
    route: string[];
}

export declare interface UniswapLpTokenConfig {
    type: 'lpToken';
    token0: string;
    token1: string;
}

export declare interface CollateralConfig {
    title: string;
    ilk: string;
    symbol: string;
    decimals: number;
    uniswap: UniswapTokenConfig | UniswapLpTokenConfig;
}

export declare interface NetworkConfig {
    chainId: string;
    title: string;
    url: string;
    gasPrice?: number;
    etherscanUrl: string;
    uniswapV2CalleeDaiAddress: string;
    uniswapV2LpTokenCalleeDaiAddress: string;
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

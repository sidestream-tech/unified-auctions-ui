// stub modules that unfortunately don't have any types
declare module '@makerdao/*';
declare module 'dai-monorepo/*';

declare type BigNumber = any;

declare interface AuctionInitialInfo {
    id: string;
    auctionId: number;
    collateralType: string;
    collateralSymbol: string;
    amountRAW: BigNumber | number;
    debtDAI: BigNumber;
    till: string;
    vaultOwner: string;
    isActive: boolean;
    isFinished: boolean;
    isRestarting: boolean;
    marketPricePerCollateral?: BigNumber | number;
    marketValue?: BigNumber | number;
    transactionProfit?: BigNumber | number;
    transactionAddress?: string;
    start: Date;
    step: BigNumber;
    cut: BigNumber;
}

declare interface Auction extends AuctionInitialInfo {
    amountPerCollateral: BigNumber | number;
    amountDAI: BigNumber | number;
}

declare interface TransactionFees {
    biddingTransactionFeeETH: BigNumber | number;
    biddingTransactionFeeDAI: BigNumber | number;
    authTransactionFeeETH: BigNumber | number;
    authTransactionFeeDAI: BigNumber | number;
    restartTransactionFeeETH: BigNumber | number;
}

declare interface AuctionTransaction extends Auction, TransactionFees {
    transactionOutcome: BigNumber | number;
}

declare interface UniswapTokenConfig {
    type: 'token';
    route: string[];
}

declare interface UniswapLpTokenConfig {
    type: 'lpToken';
    token0: string;
    token1: string;
}

declare interface CollateralConfig {
    title: string;
    ilk: string;
    symbol: string;
    decimals: number;
    uniswap: UniswapTokenConfig | UniswapLpTokenConfig;
}

declare interface NetworkConfig {
    chainId: string;
    title: string;
    url: string;
    gasPrice?: number;
    etherscanUrl: string;
    uniswapV2CalleeDaiAddress: string;
    uniswapV2LpTokenCalleeDaiAddress: string;
}

declare interface MakerParams {
    step: BigNumber | number;
    cut: BigNumber | number;
}

declare interface MessageContent {
    key: string;
    content: string;
    duration: number;
}

declare interface Notifier {
    (messageType: 'loading' | 'error' | 'success' | 'info', messageContent: MessageContent): void;
}

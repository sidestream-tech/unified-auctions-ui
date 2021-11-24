// allow typescript to properly process svg imports
declare module '*.svg' {
    import Vue from 'vue';
    export default Vue;
}

// allow typescript to properly process png imports
declare module '*.png' {
    const content: string;
    export default content;
}
declare module '*.jpg' {
    const content: string;
    export default content;
}

// stub modules that unfortunetely doesn't have any types
declare module '@makerdao/*' {
    const content: any;
    export default content;
}
declare module 'dai-monorepo/*' {
    const content: any;
    export default content;
}

declare interface Auction {
    id: string;
    auctionId: number;
    collateralType: string;
    collateralSymbol: string;
    amountRAW: BigNumber | number;
    amountDAI: BigNumber | number;
    amountPerCollateral: BigNumber | number;
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

declare interface Indexable {
    [key: string]: any;
}

declare interface SelectOption {
    label: string;
    value: string;
    icon?: object;
}

declare interface MakerParams {
    step: number;
    cut: number;
    drop: number;
}

declare interface Window {
    maker?: any;
    ethereum?: any;
}

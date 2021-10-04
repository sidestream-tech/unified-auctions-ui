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

// stub modules that unfortunetely doesn't have any types
declare module '@makerdao/*' {
    const content: any;
    export default content;
}

declare interface Auction {
    id: string;
    collateralType: string;
    amountRAW: BigNumber | number;
    amountDAI: BigNumber | number;
    till: string;
    vaultOwner: string;
    amountPerCollateral: number;
    isActive: boolean;
    marketValue?: number;
    transactionAddress?: string;
}

declare interface AuctionTransaction extends Auction {
    transactionProfit: number;
    transactionFeeETH: number;
    transactionFeeDAI: number;
    transactionOutcome: number;
}

declare interface CollateralConfig {
    title: string;
    ilk: string;
    symbol: string;
    decimals: number;
}

declare interface NetworkConfig {
    chainId: string;
    title: string;
    url: string;
    etherscanUrl: string;
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
    ethereum?: any;
}

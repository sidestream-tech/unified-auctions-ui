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

declare interface Auction {
    id: string;
    collateralType: string;
    amountRAW: number;
    amountDAI: number;
    till: string;
    marketValue: number;
    vaultOwner: string;
    amountPerCollateral: number;
}

declare interface Indexable {
    [key: string]: any;
}

declare interface SelectOption {
    label: string;
    value: string;
}

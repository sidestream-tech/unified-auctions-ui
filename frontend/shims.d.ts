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
    amountRAW: string;
    amountDAI: string;
    till: string;
    moreData?: string;
}

declare interface SelectOption {
    label: string;
    value: string;
}

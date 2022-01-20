// allow typescript to properly process svg imports
declare module '*.svg' {
    import Vue from 'vue';
    export default Vue;
}

// allow typescript to properly process image imports
declare module '*.png' {
    const content: string;
    export default content;
}
declare module '*.jpg' {
    const content: string;
    export default content;
}

declare interface Window {
    maker?: any;
    ethereum?: any;
}

declare interface SelectOption {
    label: string;
    value: string;
    icon?: object;
}

// As there are no types for this package I defined the module, to silence any warning we get.
declare module 'animated-number-vue' {}

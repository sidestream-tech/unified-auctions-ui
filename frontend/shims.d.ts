// allow typescript to properly process svg imports
declare module '*.svg' {
    import Vue from 'vue';
    export default Vue;
}

declare module 'animated-number-vue' {}

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

declare interface FeatureItem {
    text: string;
    indent: number;
}

declare interface FeatureList {
    title: string;
    url: string | undefined;
    features: FeatureItem[];
}

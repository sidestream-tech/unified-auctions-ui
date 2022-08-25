// allow typescript to properly process svg imports
declare module '*.svg' {
    import Vue from 'vue';
    export default Vue;
}

declare module 'animated-number-vue' {}
declare module '@ivanv/vue-collapse-transition' {}

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
    href?: string;
}

declare interface FeatureItem {
    text: string;
    items?: FeatureItem[];
}

declare interface FeatureList {
    title: string;
    url: string | undefined;
    items: FeatureItem[];
}

declare interface PanelProps {
    name: string;
    title: string;
}

// HeapIO typescript definition, see https://developers.heap.io/reference#client-side-apis-overview
interface Heap {
    load: (e?: string) => void;
    track: (event: string, properties?: Object) => void;
    identify: (identity: string) => void;
    resetIdentity: () => void;
    addUserProperties: (properties: Object) => void;
    addEventProperties: (properties: Object) => void;
    removeEventProperty: (property: string) => void;
    clearEventProperties: () => void;
    appid: string;
    userId: string;
    identity: string | null;
    config: any;
    loaded?: boolean;
}

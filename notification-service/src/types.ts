export interface EventSubscription {
    id: string;
    contract: string;
    abi: any;
    eventNames: string[];
    generateText: (latestEvent: any, previousEvent: any) => string;
}

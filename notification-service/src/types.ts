export interface EventSubscription {
    id: string;
    contract: string;
    abi: any;
    eventName: string;
    generateText: (latestEvent: any, previousEvent: any) => string;
}

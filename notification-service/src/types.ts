export interface EventSubscription {
    id: string;
    contract: string;
    abi: any;
    eventNames: string[];
}

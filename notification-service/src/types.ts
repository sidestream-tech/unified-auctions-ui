export interface EventSubscription {
    id: string;
    contract: string;
    eventNames: string[];
}

export interface Receiver {
    email: string;
    subscriptions: string[];
}

export interface MailData {
    eventName: string;
    contractAddress: string;
    transactionHash: string;
    subscriptionId: string;
}

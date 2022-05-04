export interface EventSubscription {
    id: string;
    contract: string;
    eventName: string;
    formatData: (event: any) => string;
}

export interface Receiver {
    email: string;
    subscriptions: string[];
}

export interface MailData {
    eventSubscription: EventSubscription;
    eventData: any;
    formattedData: any;
}

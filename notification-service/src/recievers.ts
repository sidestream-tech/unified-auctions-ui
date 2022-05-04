import { RECEIVERS } from './variables';
import validator from 'validator';
import { Receiver } from './types';
import { getSubscriptionById } from './constants/SUBSCRIPTIONS';

function validateReceivers(receivers: Receiver[]) {
    const invalidEmails: string[] = [];
    const invalidEventSubscriptions: string[] = [];

    receivers.forEach(receiver => {
        if (!validator.isEmail(receiver.email)) {
            invalidEmails.push(receiver.email);
        }
        receiver.subscriptions.forEach(eventSubscription => {
            if (!getSubscriptionById(eventSubscription)) {
                invalidEventSubscriptions.push(eventSubscription);
            }
        });
    });
    if (invalidEmails.length > 0) {
        throw new Error(`receivers: invalid emails found for "${invalidEmails.toString()}"`);
    }
    if (invalidEventSubscriptions.length > 0) {
        throw new Error(`receivers: invalid event subscriptions found for "${invalidEventSubscriptions.toString()}"`);
    }
}

export function parseReceiverList(receivers: string): Receiver[] {
    const receiverObjects = JSON.parse(JSON.parse(`"${receivers}"`));
    const receiverIds = Object.keys(receiverObjects);

    return receiverIds.map(receiverId => ({
        email: receiverId,
        subscriptions: receiverObjects[receiverId],
    }));
}

export function setupReceiverList() {
    if (RECEIVERS) {
        const parsedList = parseReceiverList(RECEIVERS);
        validateReceivers(parsedList);
    } else {
        throw new Error('receivers: please specify at least one email address in RECEIVERS');
    }
}

export function getReceiversForSubscriptionId(subscriptionId: string) {
    if (!RECEIVERS) {
        return undefined;
    }
    const parsedList = parseReceiverList(RECEIVERS);

    const receivers: string[] = [];
    parsedList.forEach(emailSubscriber => {
        if (emailSubscriber.subscriptions.includes(subscriptionId) && !receivers.includes(emailSubscriber.email)) {
            receivers.push(emailSubscriber.email);
        }
    });
    return receivers;
}

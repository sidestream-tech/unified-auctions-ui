import { RECEIVERS } from './variables';
import { Receiver } from './types';
import { getSubscriptionById } from './constants/SUBSCRIPTIONS';
import { validateEmailReceivers } from './notifiers/mailer';

function validateSubscriptions(subscriptions: string[]) {
    const invalidEventSubscriptions: string[] = [];
    subscriptions.forEach(subscription => {
        if (!getSubscriptionById(subscription)) {
            invalidEventSubscriptions.push(subscription);
        }
    });
    if (invalidEventSubscriptions.length > 0) {
        throw new Error(`receivers: invalid event subscriptions found for "${invalidEventSubscriptions.toString()}"`);
    }
}

export function getReceiversByType(receivers: Receiver[], type: string) {
    return receivers
        .filter(receiver => {
            return receiver.type === type;
        })
        .map(receiver => {
            return receiver.receiver;
        });
}

function validateReceivers(receivers: Receiver[]) {
    receivers.forEach(receiver => {
        validateSubscriptions(receiver.subscriptions);
    });

    validateEmailReceivers(getReceiversByType(receivers, 'email'));
}

export function parseReceiverList(receivers: string): Receiver[] {
    return JSON.parse(JSON.parse(`"${receivers}"`));
}

export function getReceiversForSubscriptionId(subscriptionId: string) {
    if (!RECEIVERS) {
        throw new Error('receivers: please specify at least one receiver in RECEIVERS');
    }
    const parsedList = parseReceiverList(RECEIVERS);

    const receivers: Receiver[] = [];
    parsedList.forEach(receiver => {
        if (receiver.subscriptions.includes(subscriptionId)) {
            receivers.push(receiver);
        }
    });
    return receivers;
}

export function validateReceiverList() {
    if (RECEIVERS) {
        const parsedList = parseReceiverList(RECEIVERS);
        validateReceivers(parsedList);
    } else {
        throw new Error('receivers: please specify at least one receiver in RECEIVERS');
    }
}

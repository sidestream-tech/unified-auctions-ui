import { RECEIVERS } from './variables';

const validateReceivers = function (receivers: string[]) {
    const invalidEmails: string[] = [];
    receivers.forEach(receiver => {
        if (!receiver.includes('@') || !receiver.includes('.')) {
            invalidEmails.push(receiver);
        }
    });
    if (invalidEmails.length > 0) {
        throw new Error(`receivers: invalid emails found for "${invalidEmails.toString()}"`);
    }
};

export const parseReceiverList = function (receivers: string): string[] {
    return receivers.split(',').map(item => item.trim());
};

export const getReceiverList = function () {
    if (RECEIVERS) {
        return parseReceiverList(RECEIVERS);
    }
    return undefined;
};

export const setupReceiverList = function () {
    if (RECEIVERS) {
        const parsedList = parseReceiverList(RECEIVERS);
        validateReceivers(parsedList);
    } else {
        console.warn(`receivers: skipping setup due to missing RECEIVERS`);
    }
};

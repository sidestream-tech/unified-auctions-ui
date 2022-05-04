import { RECEIVERS } from './variables';
import validator from 'validator';

const validateReceivers = function (receivers: string[]) {
    const invalidEmails: string[] = [];
    receivers.forEach(receiver => {
        if (!validator.isEmail(receiver)) {
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
        throw new Error('receivers: please specify at least one email address in RECEIVERS');
    }
};

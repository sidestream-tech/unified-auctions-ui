import faker from 'faker';
import BigNumber from 'bignumber.js';
import { SurplusEvent } from 'auctions-core/src/types';
import { random } from 'lodash';

const EVENT_TYPES = ['start', 'bid', 'collect'];

export function generateFakeSurplusEvent(): SurplusEvent {
    const transactionAddress = faker.finance.ethereumAddress();
    const type = faker.helpers.randomize(EVENT_TYPES);
    const walletAddress = faker.finance.ethereumAddress();
    const amount = type === 'bid' ? new BigNumber(parseFloat(faker.finance.amount())) : undefined;
    const date = faker.date.recent();

    return {
        transactionAddress,
        type,
        walletAddress,
        amount,
        date,
    };
}

export const generateFakeSurplusEvents = function (number = random(5, 15)) {
    return Array(number).fill(null).map(generateFakeSurplusEvent);
};

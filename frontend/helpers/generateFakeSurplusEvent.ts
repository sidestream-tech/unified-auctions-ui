import { SurplusAuctionEventTypes, SurplusEvent } from 'auctions-core/src/types';
import faker from 'faker';
import { random } from 'lodash';
import BigNumber from 'bignumber.js';

export const generateFakeSurplusEvent = function (type?: SurplusAuctionEventTypes): SurplusEvent {
    const bidAmountMKR = new BigNumber(faker.finance.amount());
    const transactionHash = faker.finance.ethereumAddress();
    const address = faker.finance.ethereumAddress();
    const transactionDate = faker.date.recent();
    const generatedType = type || 'bid';

    return {
        bidAmountMKR,
        type: generatedType,
        transactionHash,
        transactionDate,
        address,
    };
};

export const generateFakeSurplusBidEvents = function (number = random(5, 15)) {
    return Array(number).fill(null).map(generateFakeSurplusEvent);
};

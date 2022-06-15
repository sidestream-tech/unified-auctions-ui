import { SurplusAuctionData, SurplusAuctionStates } from 'auctions-core/src/types';
import BigNumber from 'bignumber.js';
import faker from 'faker';
import { random } from 'lodash';

const SURPLUS_AUCTION_STATES: SurplusAuctionStates[] = [
    'just-started',
    'have-bids',
    'ready-for-collection',
    'collected',
    'requires-restart',
];

export const generateFakeSurplusAuctionData = function (): SurplusAuctionData {
    const bidAmountMKR = new BigNumber(parseFloat(faker.finance.amount()));
    const receiveAmountDAI = new BigNumber(parseFloat(faker.finance.amount()));
    const receiverAddress = faker.finance.ethereumAddress();
    const auctionEndDate = faker.date.soon();
    const bidEndDate = faker.date.soon();
    const earliestEndDate =
        auctionEndDate.getUTCMilliseconds() > bidEndDate.getUTCMilliseconds() ? bidEndDate : auctionEndDate;
    const state: SurplusAuctionStates = faker.helpers.randomize(SURPLUS_AUCTION_STATES);

    return {
        bidAmountMKR,
        receiveAmountDAI,
        receiverAddress,
        auctionEndDate,
        bidEndDate,
        earliestEndDate,
        state,
    };
};

export const generateFakeSurplusAuctionsData = function (number = random(5, 15)) {
    return Array(number).fill(null).map(generateFakeSurplusAuctionData);
};

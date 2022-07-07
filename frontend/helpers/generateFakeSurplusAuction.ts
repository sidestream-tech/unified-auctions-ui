import { SurplusAuction, SurplusAuctionStates } from 'auctions-core/src/types';
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

export const generateFakeSurplusAuction = function (): SurplusAuction {
    const id = faker.datatype.number();
    const state: SurplusAuctionStates = faker.helpers.randomize(SURPLUS_AUCTION_STATES);
    const bidAmountMKR = new BigNumber(parseFloat(faker.finance.amount()));
    const receiveAmountDAI = new BigNumber(parseFloat(faker.finance.amount()));
    const receiverAddress = faker.finance.ethereumAddress();
    const auctionEndDate = faker.date.soon();
    const bidEndDate = state === 'ready-for-collection' ? faker.date.recent() : undefined;
    const earliestEndDate = bidEndDate
        ? auctionEndDate.getUTCMilliseconds() > bidEndDate.getUTCMilliseconds()
            ? bidEndDate
            : auctionEndDate
        : auctionEndDate;

    return {
        id,
        network: 'mainnet',
        bidAmountMKR,
        receiveAmountDAI,
        receiverAddress,
        auctionEndDate,
        bidEndDate,
        earliestEndDate,
        state,
    };
};

export const generateFakeSurplusAuctions = function (number = random(5, 15)) {
    return Array(number).fill(null).map(generateFakeSurplusAuction);
};

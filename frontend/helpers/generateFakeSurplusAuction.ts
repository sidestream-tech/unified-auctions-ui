import { SurplusAuction, SurplusAuctionData, SurplusAuctionState } from 'auctions-core/src/types';
import BigNumber from 'bignumber.js';
import faker from 'faker';
import { random } from 'lodash';

const SURPLUS_AUCTION_STATES: SurplusAuctionState[] = [
    'just-started',
    'have-bids',
    'ready-for-collection',
    'collected',
    'requires-restart',
];

export const generateFakeSurplusAuctionData = function (): SurplusAuctionData {
    const id = faker.datatype.number();
    const state: SurplusAuctionState = faker.helpers.randomize(SURPLUS_AUCTION_STATES);
    const receiveAmountDAI = new BigNumber(parseFloat(faker.finance.amount()));
    const auctionEndDate = faker.date.soon();
    const bidEndDate = state === 'ready-for-collection' ? faker.date.recent() : undefined;
    const earliestEndDate = bidEndDate
        ? auctionEndDate.getUTCMilliseconds() > bidEndDate.getUTCMilliseconds()
            ? bidEndDate
            : auctionEndDate
        : auctionEndDate;

    const receiverAddress = state !== 'just-started' ? faker.finance.ethereumAddress() : undefined;
    const bidAmountMKR = state !== 'just-started' ? new BigNumber(faker.finance.amount()) : undefined;
    const unitPrice = bidAmountMKR ? bidAmountMKR.dividedBy(receiveAmountDAI) : undefined;

    return {
        id,
        network: 'mainnet',
        receiveAmountDAI,
        receiverAddress,
        bidAmountMKR,
        unitPrice,
        auctionEndDate,
        bidEndDate,
        earliestEndDate,
        state,
    };
};

export const generateFakeSurplusAuction = function (): SurplusAuction {
    const surplusAuctionData = generateFakeSurplusAuctionData();
    const marketUnitPrice =
        surplusAuctionData.state === 'have-bids' ? new BigNumber(parseFloat(faker.finance.amount())) : undefined;

    return {
        ...surplusAuctionData,
        marketUnitPrice,
    };
};

export const generateFakeSurplusAuctions = function (number = random(5, 15)) {
    return Array(number).fill(null).map(generateFakeSurplusAuction);
};

import { SurplusAuction, SurplusAuctionBase, SurplusAuctionStates } from 'auctions-core/src/types';
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

const NETWORKS = ['mainnet', 'kovan', 'goerli'];

const generateFakeSurplusAuctionBase = function (): SurplusAuctionBase {
    return {
        id: faker.datatype.number(),
        network: faker.helpers.randomize(NETWORKS),
    };
};

export const generateFakeSurplusAuction = function (
    state?: SurplusAuctionStates
): SurplusAuction | SurplusAuctionBase {
    const auctionBaseData = generateFakeSurplusAuctionBase();
    const generatedState: SurplusAuctionStates = state || faker.helpers.randomize(SURPLUS_AUCTION_STATES);
    const receiveAmountDAI = new BigNumber(parseFloat(faker.finance.amount()));
    const receiverAddress = faker.finance.ethereumAddress();
    const auctionEndDate = faker.date.soon();
    const bidEndDate = generatedState === 'have-bids' ? faker.date.recent() : undefined;
    const earliestEndDate = bidEndDate
        ? auctionEndDate.getUTCMilliseconds() > bidEndDate.getUTCMilliseconds()
            ? bidEndDate
            : auctionEndDate
        : auctionEndDate;
    const bidAmountMKR = new BigNumber(generatedState === 'just-started' ? 0 : parseFloat(faker.finance.amount()));
    
    return {
        ...auctionBaseData,
        network: 'mainnet',
        receiveAmountDAI,
        receiverAddress,
        auctionEndDate,
        bidEndDate,
        earliestEndDate,
        state: generatedState,
        bidAmountMKR,
    };
};

export const generateFakeSurplusAuctions = function (number = random(5, 15)) {
    return Array(number).fill(null).map(generateFakeSurplusAuction);
};

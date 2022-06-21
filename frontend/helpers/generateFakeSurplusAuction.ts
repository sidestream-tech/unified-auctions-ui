import { SurplusAuction, SurplusAuctionData, SurplusAuctionStates, SurplusEvent } from 'auctions-core/src/types';
import BigNumber from 'bignumber.js';
import faker from 'faker';
import { random } from 'lodash';
import { generateFakeSurplusBidEvents, generateFakeSurplusEvent } from '~/helpers/generateFakeSurplusEvent';

const SURPLUS_AUCTION_STATES: SurplusAuctionStates[] = [
    'just-started',
    'have-bids',
    'ready-for-collection',
    'collected',
    'requires-restart',
];

export const generateFakeSurplusAuctionData = function (state?: SurplusAuctionStates): SurplusAuctionData {
    const id = faker.datatype.number();
    const generatedState: SurplusAuctionStates = state || faker.helpers.randomize(SURPLUS_AUCTION_STATES);
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
        receiveAmountDAI,
        receiverAddress,
        auctionEndDate,
        bidEndDate,
        earliestEndDate,
        state: generatedState,
    };
};

export const generateFakeSurplusAuction = function (state?: SurplusAuctionStates): SurplusAuction {
    const surplusAuctionData = generateFakeSurplusAuctionData(state);
    const marketUnitPrice =
        surplusAuctionData.state === 'have-bids' ? new BigNumber(parseFloat(faker.finance.amount())) : undefined;
    const events: SurplusEvent[] = [];

    // Simulate event fetching
    events.push(generateFakeSurplusEvent('start'));

    if (surplusAuctionData.state !== 'just-started') {
        events.push(...generateFakeSurplusBidEvents());
    }

    if (surplusAuctionData.state === 'collected') {
        events.push(generateFakeSurplusEvent('collect'));
    }

    // Calculate latest bid and auction price
    const latestBids = events.filter(event => {
        return event.type === 'bid';
    });
    const highestBid = latestBids.length > 0 ? latestBids[latestBids.length - 1].bidAmountMKR : undefined;
    const auctionPrice = highestBid ? highestBid.dividedBy(surplusAuctionData.receiveAmountDAI) : undefined;

    return {
        ...surplusAuctionData,
        marketUnitPrice,
        events,
        highestBid,
        auctionPrice,
    };
};

export const generateFakeSurplusAuctions = function (number = random(5, 15)) {
    return Array(number).fill(null).map(generateFakeSurplusAuction);
};

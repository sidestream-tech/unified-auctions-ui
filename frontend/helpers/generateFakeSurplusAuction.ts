import {
    SurplusAuction,
    SurplusAuctionCollected,
    SurplusAuctionStates,
    SurplusAuctionTransaction,
} from 'auctions-core/src/types';
import BigNumber from 'bignumber.js';
import faker from 'faker';
import { random } from 'lodash';
import {
    generateFakeCompensationAuctionBase,
    generateFakeCompensationTransactionFees,
} from '~/helpers/generateFakeCompensationAuction';

const SURPLUS_AUCTION_STATES: SurplusAuctionStates[] = [
    'just-started',
    'have-bids',
    'ready-for-collection',
    'collected',
    'requires-restart',
];

export const generateFakeSurplusAuction = function (state?: SurplusAuctionStates): SurplusAuction {
    const auctionBaseData = generateFakeCompensationAuctionBase();
    const generatedState: SurplusAuctionStates = state || faker.helpers.randomize(SURPLUS_AUCTION_STATES);

    if (generatedState === 'collected') {
        return {
            ...auctionBaseData,
            state: generatedState,
        };
    }

    const receiveAmountDAI = new BigNumber(parseFloat(faker.finance.amount()));
    const receiverAddress = faker.finance.ethereumAddress();
    const auctionEndDate = generatedState === 'ready-for-collection' ? faker.date.recent() : faker.date.soon();
    const auctionStartDate = generatedState === 'ready-for-collection' ? faker.date.recent() : faker.date.soon();
    const bidEndDate = generatedState === 'have-bids' ? faker.date.recent() : undefined;
    const earliestEndDate = bidEndDate
        ? auctionEndDate.getUTCMilliseconds() > bidEndDate.getUTCMilliseconds()
            ? bidEndDate
            : auctionEndDate
        : auctionEndDate;
    const bidAmountMKR = new BigNumber(
        generatedState === 'just-started' ? 0 : faker.datatype.number({ min: 0.0001, max: 1, precision: 0.0000001 })
    );

    return {
        ...auctionBaseData,
        receiveAmountDAI,
        receiverAddress,
        auctionEndDate,
        auctionStartDate,
        bidEndDate,
        earliestEndDate,
        state: generatedState,
        bidAmountMKR,
    };
};

export const generateFakeSurplusAuctionTransaction = function (
    state?: SurplusAuctionStates
): SurplusAuctionCollected | SurplusAuctionTransaction {
    const surplusAuction = generateFakeSurplusAuction(state);

    if (surplusAuction.state === 'collected') {
        return surplusAuction;
    }

    const transactionFees = generateFakeCompensationTransactionFees();

    // generate fake market data
    const approximateUnitPrice = surplusAuction.bidAmountMKR.dividedBy(surplusAuction.receiveAmountDAI);
    const marketUnitPriceToUnitPriceRatio = new BigNumber(
        faker.datatype.number({ min: -0.3, max: 0.3, precision: 0.001 })
    );
    const marketUnitPrice = approximateUnitPrice.multipliedBy(new BigNumber(1).minus(marketUnitPriceToUnitPriceRatio));

    const nextMinimumBid = surplusAuction.bidAmountMKR
        ? surplusAuction.bidAmountMKR.multipliedBy(1.05)
        : new BigNumber(0);

    return {
        ...surplusAuction,
        ...transactionFees,
        marketUnitPrice,
        marketUnitPriceToUnitPriceRatio,
        unitPrice: approximateUnitPrice,
        nextMinimumBid,
    };
};

export const generateFakeSurplusAuctions = function (number = random(5, 15)) {
    return Array(number).fill(null).map(generateFakeSurplusAuction);
};

export const generateFakeSurplusAuctionTransactions = function (number = random(5, 15)) {
    return Array(number).fill(null).map(generateFakeSurplusAuctionTransaction);
};

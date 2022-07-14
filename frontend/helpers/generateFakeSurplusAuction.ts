import {
    SurplusAuction,
    SurplusAuctionBase,
    SurplusAuctionStates,
    SurplusAuctionTransaction,
    SurplusTransactionFees,
} from 'auctions-core/src/types';
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

export const generateFakeSurplusAuction = function (state?: SurplusAuctionStates): SurplusAuction {
    const auctionBaseData = generateFakeSurplusAuctionBase();
    const generatedState: SurplusAuctionStates = state || faker.helpers.randomize(SURPLUS_AUCTION_STATES);
    const fetchedAt = new Date();

    if (generatedState === 'collected') {
        return {
            ...auctionBaseData,
            state: generatedState,
            fetchedAt,
        };
    }

    const receiveAmountDAI = new BigNumber(parseFloat(faker.finance.amount()));
    const receiverAddress = faker.finance.ethereumAddress();
    const auctionEndDate = generatedState === 'ready-for-collection' ? faker.date.recent() : faker.date.soon();
    const bidEndDate = generatedState === 'have-bids' ? faker.date.recent() : undefined;
    const earliestEndDate = bidEndDate
        ? auctionEndDate.getUTCMilliseconds() > bidEndDate.getUTCMilliseconds()
            ? bidEndDate
            : auctionEndDate
        : auctionEndDate;
    const bidAmountMKR = new BigNumber(generatedState === 'just-started' ? 0 : parseFloat(faker.finance.amount()));

    return {
        ...auctionBaseData,
        receiveAmountDAI,
        receiverAddress,
        auctionEndDate,
        bidEndDate,
        earliestEndDate,
        state: generatedState,
        bidAmountMKR,
        fetchedAt,
    };
};

export const generateFakeSurplusTransactionFees = function (): SurplusTransactionFees {
    const bidTransactionFee = new BigNumber(parseFloat(faker.finance.amount(0.01, 1)));
    const authTransactionFeeDAI = new BigNumber(parseFloat(faker.finance.amount(0.01, 1)));
    const authTransactionFeeMKR = new BigNumber(parseFloat(faker.finance.amount(0.01, 1)));
    const restartTransactionFee = new BigNumber(parseFloat(faker.finance.amount(0.01, 1)));
    const collectTransactionFee = new BigNumber(parseFloat(faker.finance.amount(0.01, 1)));

    return {
        bidTransactionFee,
        authTransactionFeeDAI,
        authTransactionFeeMKR,
        restartTransactionFee,
        collectTransactionFee,
    };
};

export const generateFakeSurplusAuctionTransaction = function (
    state?: SurplusAuctionStates
): SurplusAuctionTransaction {
    const surplusAuction = generateFakeSurplusAuction(state);

    // if auction does not have any bids yet or is finished return without market data
    if (!surplusAuction.bidAmountMKR || !surplusAuction.receiveAmountDAI) {
        return surplusAuction;
    }

    const transactionFees = generateFakeSurplusTransactionFees();
    const combinedBidFees = transactionFees.bidTransactionFee
        ?.plus(transactionFees.authTransactionFeeMKR || 0)
        .plus(transactionFees.authTransactionFeeDAI || 0);

    // generate fake market data
    const approximateUnitPrice = surplusAuction.bidAmountMKR.dividedBy(surplusAuction.receiveAmountDAI);
    const marketUnitPriceToUnitPriceRatio = new BigNumber(
        faker.datatype.number({ min: -0.3, max: 0.3, precision: 0.001 })
    );
    const marketUnitPrice = approximateUnitPrice.multipliedBy(
        new BigNumber(1).minus(marketUnitPriceToUnitPriceRatio || 0)
    );

    const nextMinimumBid = surplusAuction.bidAmountMKR
        ? surplusAuction.bidAmountMKR.multipliedBy(1.05)
        : new BigNumber(0);

    return {
        ...surplusAuction,
        ...transactionFees,
        marketUnitPrice,
        marketUnitPriceToUnitPriceRatio,
        unitPrice: approximateUnitPrice,
        combinedBidFees,
        nextMinimumBid,
    };
};

export const generateFakeSurplusAuctions = function (number = random(5, 15)) {
    return Array(number).fill(null).map(generateFakeSurplusAuction);
};

export const generateFakeSurplusAuctionTransactions = function (number = random(5, 15)) {
    return Array(number).fill(null).map(generateFakeSurplusAuctionTransaction);
};

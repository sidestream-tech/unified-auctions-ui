import {
    SurplusAuction,
    SurplusAuctionBase,
    SurplusAuctionStates,
    SurplusAuctionCollected,
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
        fetchedAt: new Date(),
    };
};

export const generateFakeSurplusAuction = function (state?: SurplusAuctionStates): SurplusAuction {
    const auctionBaseData = generateFakeSurplusAuctionBase();
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
        bidEndDate,
        earliestEndDate,
        state: generatedState,
        bidAmountMKR,
    };
};

export const generateFakeSurplusTransactionFees = function (): SurplusTransactionFees {
    return {
        restartTransactionFeeEth: new BigNumber(faker.finance.amount(0.01, 1)),
        allowanceTransactionFeeEth: new BigNumber(faker.finance.amount(0.01, 1)),
        bidTransactionFeeEth: new BigNumber(faker.finance.amount(0.01, 1)),
        collectTransactionFeeEth: new BigNumber(faker.finance.amount(0.01, 1)),
        authTransactionFeeEth: new BigNumber(faker.finance.amount(0.01, 1)),
        allowanceTransactionFeeDai: new BigNumber(faker.finance.amount(0.01, 1)),
        restartTransactionFeeDai: new BigNumber(faker.finance.amount(0.01, 1)),
        bidTransactionFeeDai: new BigNumber(faker.finance.amount(0.01, 1)),
        collectTransactionFeeDai: new BigNumber(faker.finance.amount(0.01, 1)),
        authTransactionFeeDai: new BigNumber(faker.finance.amount(0.01, 1)),
    };
};

export const generateFakeSurplusAuctionTransaction = function (
    state?: SurplusAuctionStates
): SurplusAuctionCollected | SurplusAuctionTransaction {
    const surplusAuction = generateFakeSurplusAuction(state);

    if (surplusAuction.state === 'collected') {
        return surplusAuction;
    }

    const transactionFees = generateFakeSurplusTransactionFees();
    const combinedBidFeesDai = transactionFees.bidTransactionFeeDai.plus(transactionFees.collectTransactionFeeDai);

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
        combinedBidFeesDai,
        nextMinimumBid,
    };
};

export const generateFakeSurplusAuctions = function (number = random(5, 15)) {
    return Array(number).fill(null).map(generateFakeSurplusAuction);
};

export const generateFakeSurplusAuctionTransactions = function (number = random(5, 15)) {
    return Array(number).fill(null).map(generateFakeSurplusAuctionTransaction);
};

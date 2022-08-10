import BigNumber from 'bignumber.js';
import faker from 'faker';
import { random } from 'lodash';
import { DebtAuction, DebtAuctionCollected, DebtAuctionStates, DebtAuctionTransaction } from 'auctions-core/src/types';
import {
    generateFakeCompensationAuctionBase,
    generateFakeCompensationTransactionFees,
} from '~/helpers/generateFakeCompensationAuction';

const DEBT_AUCTION_STATES: DebtAuctionStates[] = [
    'just-started',
    'have-bids',
    'ready-for-collection',
    'collected',
    'requires-restart',
];

export const generateFakeDebtAuction = function (state?: DebtAuctionStates): DebtAuction {
    const auctionBaseData = generateFakeCompensationAuctionBase();
    const generatedState: DebtAuctionStates = state || faker.helpers.randomize(DEBT_AUCTION_STATES);

    if (generatedState === 'collected') {
        return {
            ...auctionBaseData,
            state: generatedState,
        };
    }

    const bidAmountDai = new BigNumber(parseFloat(faker.finance.amount()));
    const receiverAddress = faker.finance.ethereumAddress();
    const auctionEndDate = generatedState === 'ready-for-collection' ? faker.date.recent() : faker.date.soon();
    const bidEndDate = generatedState === 'have-bids' ? faker.date.recent() : undefined;
    const earliestEndDate = bidEndDate
        ? auctionEndDate.getUTCMilliseconds() > bidEndDate.getUTCMilliseconds()
            ? bidEndDate
            : auctionEndDate
        : auctionEndDate;
    const receiveAmountMKR = new BigNumber(faker.datatype.number({ min: 100, max: 200 }));

    return {
        ...auctionBaseData,
        receiveAmountMKR,
        receiverAddress,
        auctionEndDate,
        bidEndDate,
        earliestEndDate,
        state: generatedState,
        bidAmountDai,
    };
};

export const generateFakeDebtAuctionTransaction = function (
    state?: DebtAuctionStates
): DebtAuctionCollected | DebtAuctionTransaction {
    const auction = generateFakeDebtAuction(state);

    if (auction.state === 'collected') {
        return auction;
    }

    const transactionFees = generateFakeCompensationTransactionFees();

    // generate fake market data
    const approximateUnitPrice = auction.receiveAmountMKR.dividedBy(auction.bidAmountDai);
    const marketUnitPriceToUnitPriceRatio = new BigNumber(
        faker.datatype.number({ min: -0.3, max: 0.3, precision: 0.001 })
    );
    const marketUnitPrice =
        approximateUnitPrice &&
        approximateUnitPrice.multipliedBy(new BigNumber(1).minus(marketUnitPriceToUnitPriceRatio));

    const increaseCoefficient = faker.datatype.number({ min: 1, max: 1.5, precision: 0.01 });
    const nextMaximumLotReceived = auction.receiveAmountMKR.dividedBy(increaseCoefficient);

    return {
        ...auction,
        ...transactionFees,
        marketUnitPrice,
        marketUnitPriceToUnitPriceRatio,
        unitPrice: approximateUnitPrice,
        nextMaximumLotReceived,
    };
};

export const generateFakeDebtAuctions = function (number = random(5, 15)) {
    return Array(number).fill(null).map(generateFakeDebtAuction);
};

export const generateFakeDebtAuctionTransactions = function (number = random(5, 15)) {
    return Array(number).fill(null).map(generateFakeDebtAuctionTransaction);
};

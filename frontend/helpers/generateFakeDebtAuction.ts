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

export const generateFakeDebtAuction = function (state?: DebtAuctionStates, network?: string): DebtAuction {
    const auctionBaseData = generateFakeCompensationAuctionBase(network);
    const generatedState: DebtAuctionStates = state || faker.helpers.randomize(DEBT_AUCTION_STATES);

    if (generatedState === 'collected') {
        return {
            ...auctionBaseData,
            state: generatedState,
        };
    }

    const bidAmountDai = new BigNumber(faker.datatype.number({ min: 10 * 1000, max: 50 * 1000, precision: 0.01 }));
    const receiverAddress = faker.finance.ethereumAddress();
    const auctionStartDate = faker.date.past();
    const auctionEndDate = generatedState === 'ready-for-collection' ? faker.date.recent() : faker.date.soon();
    const bidEndDate = generatedState === 'have-bids' ? faker.date.recent() : undefined;
    const earliestEndDate = bidEndDate
        ? auctionEndDate.getUTCMilliseconds() > bidEndDate.getUTCMilliseconds()
            ? bidEndDate
            : auctionEndDate
        : auctionEndDate;
    const receiveAmountMKR = new BigNumber(faker.datatype.number({ min: 100, max: 200, precision: 0.01 }));

    return {
        ...auctionBaseData,
        receiveAmountMKR,
        receiverAddress,
        auctionEndDate,
        bidEndDate,
        earliestEndDate,
        state: generatedState,
        bidAmountDai,
        auctionStartDate,
    };
};

export const generateFakeDebtAuctionTransaction = function (
    state?: DebtAuctionStates,
    network?: string
): DebtAuctionCollected | DebtAuctionTransaction {
    const auction = generateFakeDebtAuction(state, network);

    if (auction.state === 'collected') {
        return auction;
    }

    const transactionFees = generateFakeCompensationTransactionFees();

    // generate fake market data
    const approximateUnitPrice = auction.bidAmountDai.dividedBy(auction.receiveAmountMKR);
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

export const generateFakeDebtAuctions = function (
    state?: DebtAuctionStates,
    network?: string,
    number = random(5, 15)
) {
    return Array(number)
        .fill(null)
        .map(() => generateFakeDebtAuction(state, network));
};

export const generateFakeDebtAuctionTransactions = function (
    state?: DebtAuctionStates,
    network?: string,
    number = random(5, 15)
) {
    return Array(number)
        .fill(null)
        .map(() => generateFakeDebtAuctionTransaction(state, network));
};

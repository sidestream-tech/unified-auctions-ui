import { CompensationAuctionBase, CompensationAuctionTransactionFees } from 'auctions-core/src/types';
import faker from 'faker';
import BigNumber from 'bignumber.js';

const NETWORKS = ['mainnet', 'goerli'];

export const generateFakeCompensationAuctionBase = function (network?: string): CompensationAuctionBase {
    return {
        id: faker.datatype.number(),
        network: network ?? faker.helpers.randomize(NETWORKS),
        fetchedAt: new Date(),
    };
};

export const generateFakeCompensationTransactionFees = function (): CompensationAuctionTransactionFees {
    const fees = {
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
    return {
        ...fees,
        combinedBidFeesDai: fees.bidTransactionFeeDai.plus(fees.collectTransactionFeeDai),
        combinedBidFeesEth: fees.bidTransactionFeeEth.plus(fees.collectTransactionFeeEth),
    };
};

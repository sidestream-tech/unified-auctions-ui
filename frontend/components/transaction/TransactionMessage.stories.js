import { storiesOf } from '@storybook/vue';
import faker from 'faker';
import TransactionMessage from './TransactionMessage';
import { generateFakeAuctionTransaction } from '~/helpers/generateFakeAuction.ts';

const fakeAuctionTransaction = generateFakeAuctionTransaction();

const common = {
    components: { TransactionMessage },
    data() {
        return {
            swapTransactionFeeETH: fakeAuctionTransaction.swapTransactionFeeETH,
            bidTransactionFeeETH: fakeAuctionTransaction.bidTransactionFeeETH,
            authTransactionFeeETH: fakeAuctionTransaction.authTransactionFeeETH,
            combinedSwapFeesETH: fakeAuctionTransaction.combinedSwapFeesETH,
            combinedBidFeesETH: fakeAuctionTransaction.combinedBidFeesETH,
        };
    },
};

storiesOf('Transaction/TransactionMessage', module)
    .add('Default', () => ({
        ...common,
        template: `
            <TransactionMessage 
                :is-wallet-connected="true"
                :swap-transaction-fee-e-t-h="swapTransactionFeeETH"
                :bid-transaction-fee-e-t-h="bidTransactionFeeETH"
                :auth-transaction-fee-e-t-h="authTransactionFeeETH"
                :combined-swap-fees-e-t-h="combinedSwapFeesETH"
                :combined-bid-fees-e-t-h="combinedBidFeesETH"
            />`,
    }))
    .add('Show "Different Wallet" Info Message', () => ({
        ...common,
        template: '<TransactionMessage show-different-wallet-info />',
    }))
    .add('Finished', () => ({
        ...common,
        data() {
            return {
                transactionAddress: faker.finance.ethereumAddress(),
            };
        },
        template: '<TransactionMessage :transaction-address="transactionAddress" />',
    }));

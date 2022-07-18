import { storiesOf } from '@storybook/vue';
import faker from 'faker';
import TransactionMessage from './TransactionMessage';
import { generateFakeAuctionTransaction } from '~/helpers/generateFakeAuction.ts';

const fakeAuctionTransaction = generateFakeAuctionTransaction();

const common = {
    components: { TransactionMessage },
    data() {
        return {
            fees: {
                type: 'swap',
                transETH: fakeAuctionTransaction.swapTransactionFeeETH,
                authETH: fakeAuctionTransaction.authTransactionFeeETH,
                totalETH: fakeAuctionTransaction.combinedSwapFeesETH,
            },
        };
    },
};

storiesOf('Transaction/TransactionMessage', module)
    .add('Default', () => ({
        ...common,
        template: '<TransactionMessage :is-wallet-connected="true" :fees="fees" />',
    }))
    .add('Show "Different Wallet" Info Message', () => ({
        ...common,
        template: '<TransactionMessage show-different-wallet-info :fees="fees" />',
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

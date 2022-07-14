import { storiesOf } from '@storybook/vue';
import faker from 'faker';
import TransactionMessage from './TransactionMessage';
import { generateFakeAuctionTransaction } from '~/helpers/generateFakeAuction.ts';

const fakeAuctionTransaction = generateFakeAuctionTransaction();

const common = {
    components: { TransactionMessage },
    data() {
        return {
            auctionTransaction: {
                ...fakeAuctionTransaction,
            },
        };
    },
};

storiesOf('Transaction/TransactionMessage', module)
    .add('Default', () => ({
        ...common,
        template: '<TransactionMessage :auction-transaction="auctionTransaction" />',
    }))
    .add('Wallet Authorized', () => ({
        ...common,
        template: '<TransactionMessage :auction-transaction="auctionTransaction" :is-wallet-authorized="true" />',
    }))
    .add('Collateral Authorized', () => ({
        ...common,
        template: '<TransactionMessage :auction-transaction="auctionTransaction" :is-collateral-authorized="true" />',
    }))
    .add('Show "Different Wallet" Info Message', () => ({
        ...common,
        template: '<TransactionMessage :auction-transaction="auctionTransaction" show-different-wallet-info />',
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

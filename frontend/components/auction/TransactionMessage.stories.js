import { storiesOf } from '@storybook/vue';
import faker from 'faker';
import TransactionMessage from './TransactionMessage';

const common = {
    components: { TransactionMessage },
};

storiesOf('Auction/TransactionMessage', module)
    .add('Default', () => ({
        ...common,
        template: '<TransactionMessage />',
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

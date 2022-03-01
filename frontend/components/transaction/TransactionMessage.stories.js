import { storiesOf } from '@storybook/vue';
import faker from 'faker';
import TransactionMessage from './TransactionMessage';

const common = {
    components: { TransactionMessage },
};

storiesOf('Transaction/TransactionMessage', module)
    .add('Default', () => ({
        ...common,
        template: '<TransactionMessage />',
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

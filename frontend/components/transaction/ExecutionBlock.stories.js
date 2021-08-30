import { storiesOf } from '@storybook/vue';
import faker from 'faker';
import ExecutionBlock from '~/components/transaction/ExecutionBlock';

const common = {
    components: { ExecutionBlock },
    data() {
        return {
            isLoading: false,
            transactionAddress: null,
            demoTransactionAddress: faker.finance.ethereumAddress(),
        };
    },
    methods: {
        execute() {
            this.isLoading = true;
            setTimeout(() => {
                this.transactionAddress = this.demoTransactionAddress;
                this.isLoading = false;
            }, 1000);
        },
    },
};

storiesOf('Transaction/ExecutionBlock', module)
    .add('Default', () => ({
        ...common,
        template:
            '<ExecutionBlock :isLoading="isLoading" @execute="execute" :transactionAddress="transactionAddress" />',
    }))
    .add('Disabled', () => ({
        ...common,
        template: '<ExecutionBlock :disabled="true" />',
    }))
    .add('Not Executed', () => ({
        ...common,
        template: '<ExecutionBlock />',
    }))
    .add('Executing', () => ({
        ...common,
        template: '<ExecutionBlock :isLoading="true"/>',
    }))
    .add('Executed', () => ({
        ...common,
        template: '<ExecutionBlock :transactionAddress="demoTransactionAddress"/>',
    }));

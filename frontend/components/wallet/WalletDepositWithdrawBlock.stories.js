import { storiesOf } from '@storybook/vue';
import faker from 'faker';
import { action } from '@storybook/addon-actions';
import WalletDepositWithdrawBlock from '~/components/wallet/WalletDepositWithdrawBlock';

const common = {
    components: { WalletDepositWithdrawBlock },
    data: () => ({
        maxDeposit: faker.datatype.number({ min: 50, max: 500 }),
        maxWithdraw: faker.datatype.number({ min: 50, max: 500 }),
    }),
    methods: {
        deposit: action('deposit'),
        withdraw: action('withdraw'),
    },
};

storiesOf('Wallet/WalletDepositWithdrawBlock', module)
    .add('Default', () => ({
        ...common,
        template: '<WalletDepositWithdrawBlock v-bind="$data" @deposit="deposit" @withdraw="withdraw" />',
    }))
    .add('Default Expert Mode', () => ({
        ...common,
        template:
            '<WalletDepositWithdrawBlock v-bind="$data" @deposit="deposit" @withdraw="withdraw" :isExplanationsShown="false" />',
    }))
    .add('Loading', () => ({
        ...common,
        template:
            '<WalletDepositWithdrawBlock :is-loading="true" v-bind="$data" @deposit="deposit" @withdraw="withdraw"  />',
    }))
    .add('No Values', () => ({
        ...common,
        template: '<WalletDepositWithdrawBlock @deposit="deposit" @withdraw="withdraw"  />',
    }));

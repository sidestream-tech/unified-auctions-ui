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
        submit: action('submit'),
    },
};

storiesOf('Wallet/WalletDepositWithdrawBlock', module)
    .add('Default', () => ({
        ...common,
        template: '<WalletDepositWithdrawBlock v-bind="$data" @submit="submit" />',
    }))
    .add('Loading', () => ({
        ...common,
        template: '<WalletDepositWithdrawBlock :is-loading="true" v-bind="$data" @submit="submit"  />',
    }))
    .add('No Values', () => ({
        ...common,
        template: '<WalletDepositWithdrawBlock @submit="submit"  />',
    }));

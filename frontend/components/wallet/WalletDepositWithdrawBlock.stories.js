import { storiesOf } from '@storybook/vue';
import faker from 'faker';
import { action } from '@storybook/addon-actions';
import BigNumber from 'bignumber.js';
import WalletDepositWithdrawBlock from '~/components/wallet/WalletDepositWithdrawBlock';

const common = {
    components: { WalletDepositWithdrawBlock },
    data: () => ({
        maxDeposit: new BigNumber(faker.datatype.number({ min: 50, max: 500 })),
        maxWithdraw: new BigNumber(faker.datatype.number({ min: 50, max: 500 })),
        minimumDaiAmount: new BigNumber(0),
        tokenAddressDAI: faker.finance.ethereumAddress(),
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
            '<WalletDepositWithdrawBlock v-bind="$data" :is-loading="true" @deposit="deposit" @withdraw="withdraw"  />',
    }));

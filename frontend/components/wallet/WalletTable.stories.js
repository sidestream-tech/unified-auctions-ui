import { storiesOf } from '@storybook/vue';
import faker from 'faker';
import BigNumber from 'bignumber.js';
import { action } from '@storybook/addon-actions';
import WalletTable from '~/components/wallet/WalletTable';

const common = {
    components: { WalletTable },
    data: () => ({
        walletAddress: faker.finance.ethereumAddress(),
        walletETH: new BigNumber(faker.finance.amount()),
        walletDAI: new BigNumber(faker.finance.amount()),
        walletVatDAI: new BigNumber(faker.finance.amount()),
        walletLastUpdatedDate: faker.date.recent(),
    }),
    methods: {
        refresh: action('refresh'),
    },
};

storiesOf('Wallet/WalletTable', module)
    .add('Default', () => ({
        ...common,
        template: '<WalletTable v-bind="$data" @refresh="refresh" />',
    }))
    .add('Loading', () => ({
        ...common,
        template: '<WalletTable :is-loading="true" v-bind="$data" />',
    }));

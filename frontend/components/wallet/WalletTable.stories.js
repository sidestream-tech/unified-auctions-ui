import { storiesOf } from '@storybook/vue';
import faker from 'faker';
import BigNumber from 'bignumber.js';
import { action } from '@storybook/addon-actions';
import WalletTable from './WalletTable';

const common = {
    components: { WalletTable },
    data: () => ({
        walletAddress: faker.finance.ethereumAddress(),
        walletBalances: {
            walletETH: new BigNumber(faker.finance.amount()),
            walletDAI: new BigNumber(faker.finance.amount()),
            walletVatDAI: new BigNumber(faker.finance.amount()),
            walletLastUpdatedDate: faker.date.recent(),
        },
        isWalletLoading: false,
    }),
    methods: {
        refresh: action('refresh'),
        connectWallet: action('connectWallet'),
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
    }))
    .add('No Wallet connected', () => ({
        ...common,
        template: '<WalletTable @connectWallet="connectWallet" />',
    }))
    .add('Loading Wallet', () => ({
        ...common,
        template: '<WalletTable @refresh="refresh" :is-wallet-loading="true" />',
    }));

import { storiesOf } from '@storybook/vue';
import faker from 'faker';
import { action } from '@storybook/addon-actions';
import BigNumber from 'bignumber.js';
import WalletModal from './WalletModal';

const common = {
    components: { WalletModal },
    data: () => ({
        isShown: true,
        walletBalances: {
            walletETH: new BigNumber(faker.finance.amount()),
            walletDAI: new BigNumber(faker.finance.amount()),
            walletVatDAI: new BigNumber(faker.finance.amount()),
            walletLastUpdatedDate: faker.date.recent(),
        },
        tokenAddressDai: faker.finance.ethereumAddress(),
        allowanceAmount: new BigNumber(faker.datatype.number({ min: 50, max: 500 })),
        isWithdrawingAllowed: true,
        walletAddress: faker.finance.ethereumAddress(),
        isWalletLoading: false,
        network: 'mainnet',
    }),
    methods: {
        refresh: action('refresh'),
        connectWallet: action('connectWallet'),
        deposit: action('deposit'),
        withdraw: action('withdraw'),
    },
};

storiesOf('Wallet/WalletModal', module)
    .add('Default', () => ({
        ...common,
        template:
            '<WalletModal v-bind="$data" @deposit="deposit" @withdraw="withdraw" @refresh="refresh" @connectWallet="connectWallet" />',
    }))
    .add('Default Expert Mode', () => ({
        ...common,
        template:
            '<WalletModal v-bind="$data" :isExplanationsShown="false" @deposit="deposit" @withdraw="withdraw" @refresh="refresh" @connectWallet="connectWallet" />',
    }))
    .add('Loading', () => ({
        ...common,
        template:
            '<WalletModal v-bind="$data" :is-loading="true" @deposit="deposit" @withdraw="withdraw" @refresh="refresh" @connectWallet="connectWallet" />',
    }))
    .add('Submitting', () => ({
        ...common,
        template:
            '<WalletModal v-bind="$data" :is-submitting="true" @deposit="deposit" @withdraw="withdraw" @refresh="refresh" @connectWallet="connectWallet" />',
    }))
    .add('No Wallet Connected', () => ({
        components: { WalletModal },
        data: () => ({
            isShown: true,
            tokenAddressDai: faker.finance.ethereumAddress(),
            allowanceAmount: new BigNumber(faker.datatype.number({ min: 50, max: 500 })),
            isWithdrawingAllowed: false,
        }),
        methods: {
            connectWallet: action('connectWallet'),
        },
        template: '<WalletModal v-bind="$data" @connectWallet="connectWallet" />',
    }))
    .add('Wallet connecting', () => ({
        components: { WalletModal },
        data: () => ({
            isShown: true,
            tokenAddressDai: faker.finance.ethereumAddress(),
            allowanceAmount: new BigNumber(faker.datatype.number({ min: 50, max: 500 })),
            isWithdrawingAllowed: false,
            isWalletLoading: true,
        }),
        methods: {
            refresh: action('refresh'),
        },
        template: '<WalletModal v-bind="$data" @refresh="refresh" />',
    }));

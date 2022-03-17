import { storiesOf } from '@storybook/vue';
import faker from 'faker';
import { action } from '@storybook/addon-actions';
import BigNumber from 'bignumber.js';
import WalletPopup from '~/components/wallet/WalletPopup';

const common = {
    components: { WalletPopup },
    data: () => ({
        maxDeposit: new BigNumber(faker.datatype.number({ min: 50, max: 500 })),
        maxWithdraw: new BigNumber(faker.datatype.number({ min: 50, max: 500 })),
        tokenAddressDAI: faker.finance.ethereumAddress(),
        isDepositingAllowed: true,
        isWithdrawingAllowed: true,
        walletAddress: faker.finance.ethereumAddress(),
        walletETH: new BigNumber(faker.finance.amount()),
        walletDAI: new BigNumber(faker.finance.amount()),
        walletVatDAI: new BigNumber(faker.finance.amount()),
        walletLastUpdatedDate: faker.date.recent(),
        isWalletLoading: false,
    }),
    methods: {
        refresh: action('refresh'),
        connectWallet: action('connectWallet'),
        deposit: action('deposit'),
        withdraw: action('withdraw'),
    },
};

storiesOf('Wallet/WalletPopup', module)
    .add('Default', () => ({
        ...common,
        template:
            '<WalletPopup v-bind="$data" @deposit="deposit" @withdraw="withdraw" @refresh="refresh" @connectWallet="connectWallet" />',
    }))
    .add('Default Expert Mode', () => ({
        ...common,
        template:
            '<WalletPopup v-bind="$data" :isExplanationsShown="false" @deposit="deposit" @withdraw="withdraw" @refresh="refresh" @connectWallet="connectWallet" />',
    }))
    .add('Loading', () => ({
        ...common,
        template:
            '<WalletPopup v-bind="$data" :is-loading="true" @deposit="deposit" @withdraw="withdraw" @refresh="refresh" @connectWallet="connectWallet" />',
    }))
    .add('Submitting', () => ({
        ...common,
        template:
            '<WalletPopup v-bind="$data" :is-submitting="true" @deposit="deposit" @withdraw="withdraw" @refresh="refresh" @connectWallet="connectWallet" />',
    }))
    .add('No Wallet Connected', () => ({
        components: { WalletPopup },
        data: () => ({
            tokenAddressDAI: faker.finance.ethereumAddress(),
            isDepositingAllowed: false,
            isWithdrawingAllowed: false,
        }),
        methods: {
            refresh: action('refresh'),
            connectWallet: action('connectWallet'),
            deposit: action('deposit'),
            withdraw: action('withdraw'),
        },
        template:
            '<WalletPopup v-bind="$data" @deposit="deposit" @withdraw="withdraw" @refresh="refresh" @connectWallet="connectWallet" />',
    }))
    .add('Wallet connecting', () => ({
        components: { WalletPopup },
        data: () => ({
            tokenAddressDAI: faker.finance.ethereumAddress(),
            isDepositingAllowed: false,
            isWithdrawingAllowed: false,
            isWalletLoading: true,
        }),
        methods: {
            refresh: action('refresh'),
            connectWallet: action('connectWallet'),
            deposit: action('deposit'),
            withdraw: action('withdraw'),
        },
        template:
            '<WalletPopup v-bind="$data" @deposit="deposit" @withdraw="withdraw" @refresh="refresh" @connectWallet="connectWallet" />',
    }));

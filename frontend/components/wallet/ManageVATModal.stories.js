import { storiesOf } from '@storybook/vue';
import faker from 'faker';
import { action } from '@storybook/addon-actions';
import BigNumber from 'bignumber.js';
import ManageVATModal from '~/components/wallet/ManageVATModal';

const common = {
    components: { ManageVATModal },
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

storiesOf('Wallet/ManageVATModal', module)
    .add('Default', () => ({
        ...common,
        template:
            '<ManageVATModal v-bind="$data" @deposit="deposit" @withdraw="withdraw" @refresh="refresh" @connectWallet="connectWallet" />',
    }))
    .add('Default Expert Mode', () => ({
        ...common,
        template:
            '<ManageVATModal v-bind="$data" :isExplanationsShown="false" @deposit="deposit" @withdraw="withdraw" @refresh="refresh" @connectWallet="connectWallet" />',
    }))
    .add('Loading', () => ({
        ...common,
        template:
            '<ManageVATModal v-bind="$data" :is-loading="true" @deposit="deposit" @withdraw="withdraw" @refresh="refresh" @connectWallet="connectWallet" />',
    }))
    .add('Submitting', () => ({
        ...common,
        template:
            '<ManageVATModal v-bind="$data" :is-submitting="true" @deposit="deposit" @withdraw="withdraw" @refresh="refresh" @connectWallet="connectWallet" />',
    }))
    .add('No Wallet Connected', () => ({
        components: { ManageVATModal },
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
            '<ManageVATModal v-bind="$data" @deposit="deposit" @withdraw="withdraw" @refresh="refresh" @connectWallet="connectWallet" />',
    }))
    .add('Wallet connecting', () => ({
        components: { ManageVATModal },
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
            '<ManageVATModal v-bind="$data" @deposit="deposit" @withdraw="withdraw" @refresh="refresh" @connectWallet="connectWallet" />',
    }));

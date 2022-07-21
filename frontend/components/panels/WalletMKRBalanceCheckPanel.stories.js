import { storiesOf } from '@storybook/vue';
import { action } from '@storybook/addon-actions';
import faker from 'faker';
import BigNumber from 'bignumber.js';
import WalletMKRBalanceCheckPanel from './WalletMKRBalanceCheckPanel';

const common = {
    components: { WalletMKRBalanceCheckPanel },
    data: () => ({
        walletMKR: new BigNumber(faker.finance.amount(50, 99)),
        requiredMKR: new BigNumber(faker.finance.amount(100, 200)),
        network: 'mainnet',
        tokenAddress: faker.finance.ethereumAddress(),
    }),
    methods: {
        refresh: action('refresh'),
        isCorrect: action('isCorrect'),
    },
    template: `
    <WalletMKRBalanceCheckPanel 
        v-bind="$data"
        @refresh="refresh"
        @update:isCorrect="isCorrect"
    />
    `,
};

storiesOf('Panels/WalletMKRBalanceCheckPanel', module)
    .add('Not enough MKR in wallet', () => ({
        ...common,
    }))
    .add('Enough MKR in wallet', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            walletMKR: new BigNumber(faker.finance.amount(201, 300)),
        }),
    }))
    .add('Refreshing Wallet', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            isLoading: true,
        }),
    }))
    .add('Disabled', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            isDisabled: true,
        }),
    }))
    .add('No Wallet connected', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            walletMKR: undefined,
        }),
    }));

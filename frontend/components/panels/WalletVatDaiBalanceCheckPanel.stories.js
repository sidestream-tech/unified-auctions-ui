import { storiesOf } from '@storybook/vue';
import { action } from '@storybook/addon-actions';
import BigNumber from 'bignumber.js';
import faker from 'faker';
import WalletVatDaiBalanceCheckPanel from './WalletVatDaiBalanceCheckPanel';

const transactionBidAmount = new BigNumber(faker.finance.amount());

const common = {
    components: { WalletVatDaiBalanceCheckPanel },
    data: () => ({
        transactionBidAmount,
        walletVatDai: new BigNumber(faker.finance.amount(0, transactionBidAmount.toNumber())),
        walletDai: new BigNumber(faker.finance.amount()),
        isLoading: false,
        disabled: false,
        isExplanationsShown: true,
    }),
    methods: {
        isCorrect: action('isCorrect'),
    },
    template: `
    <WalletVatDaiBalanceCheckPanel
        v-bind="$data"
        @update:isCorrect="isCorrect"
    />`,
};

storiesOf('Panels/WalletVatDaiBalanceCheckPanel', module)
    .add('No wallet Connected', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            walletDai: null,
            walletVatDai: null,
        }),
    }))
    .add('Not enough DAI deposited', () => ({
        ...common,
    }))
    .add('Enough DAI is deposited', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            walletVatDai: new BigNumber(faker.finance.amount(transactionBidAmount.toNumber())),
        }),
    }))
    .add('Disabled', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            disabled: true,
        }),
    }))
    .add('Loading', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            isLoading: true,
        }),
    }))
    .add('Expert Mode', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            isExplanationsShown: false,
        }),
    }));

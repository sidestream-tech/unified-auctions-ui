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
        deposit() {
            this.isLoading = true;
            setTimeout(() => {
                this.walletVatDai = this.transactionBidAmount;
                this.isLoading = false;
            }, 1000);
        },
        isCorrect: action('isCorrect'),
    },
    template: `
    <WalletVatDaiBalanceCheckPanel
        v-bind="$data"
        @manageVat="deposit"
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
    .add('Invalid Bid Amount', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            transactionBidAmount: new BigNumber(NaN),
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

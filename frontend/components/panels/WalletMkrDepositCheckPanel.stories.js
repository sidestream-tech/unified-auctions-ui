import { storiesOf } from '@storybook/vue';
import { action } from '@storybook/addon-actions';
import faker from 'faker';
import BigNumber from 'bignumber.js';
import WalletMkrDepositCheckPanel from './WalletMkrDepositCheckPanel';

const MAINNET_MKR_TOKEN_ADDRESS = '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2';

const common = {
    components: { WalletMkrDepositCheckPanel },
    data() {
        return {
            walletMkr: new BigNumber(faker.finance.amount(0, 100)),
            walletVatMkr: new BigNumber(faker.finance.amount(0, 100)),
            desiredAmount: new BigNumber(faker.finance.amount(101, 200)),
            network: 'mainnet',
            tokenAddressMkr: MAINNET_MKR_TOKEN_ADDRESS,
            isExplanationsShown: true,
            disabled: false,
            isLoading: false,
        };
    },
    methods: {
        refresh() {
            this.isLoading = true;
            setTimeout(() => {
                this.isLoading = false;
            }, 1000);
        },
        isCorrect: action('isCorrect'),
    },
    template: `
        <WalletMkrDepositCheckPanel
        v-bind="$data"
        @refresh="refresh"
        @update:isCorrect="isCorrect"
        />`,
};

storiesOf('Panels/WalletMkrDepositCheckPanel', module)
    .add('Insufficient amount of MKR present', () => ({
        ...common,
    }))
    .add('Sufficient amount of MKR present', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            walletMkr: new BigNumber(100),
            desiredAmount: new BigNumber(10),
        }),
    }))
    .add('Missing Desired Amount', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            desiredAmount: undefined,
        }),
    }))
    .add('Desired Amount is NaN', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            desiredAmount: new BigNumber(NaN),
        }),
    }))
    .add('Desired Amount is negative', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            desiredAmount: new BigNumber(-10),
        }),
    }))
    .add('No wallet connected', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            walletMkr: undefined,
            walletVatMkr: undefined,
        }),
    }))
    .add('Loading', () => ({
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
            disabled: true,
        }),
    }))
    .add('Expert Mode', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            isExplanationsShown: false,
        }),
    }));

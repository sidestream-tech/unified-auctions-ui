import { storiesOf } from '@storybook/vue';
import { action } from '@storybook/addon-actions';
import faker from 'faker';
import BigNumber from 'bignumber.js';
import WalletVATCheckPanel from './WalletVATCheckPanel';

const common = {
    components: { WalletVATCheckPanel },
    data() {
        return {
            walletAmount: new BigNumber(faker.finance.amount(0, 100)),
            walletVatAmount: new BigNumber(faker.finance.amount(0, 100)),
            desiredAmount: new BigNumber(faker.finance.amount(101, 200)),
            network: 'mainnet',
            tokenAddress: faker.finance.ethereumAddress(),
            currency: 'DAI',
            isExplanationsShown: true,
            disabled: false,
            isTableShown: true,
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
        <WalletVATCheckPanel
        v-bind="$data"
        @refresh="refresh"
        @update:isCorrect="isCorrect"
        />`,
};

storiesOf('Panels/WalletVATCheckPanel', module)
    .add('Insufficient amount present', () => ({
        ...common,
    }))
    .add('Sufficient amount present', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            walletAmount: new BigNumber(100),
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
            walletAmount: undefined,
            walletVatAmount: undefined,
        }),
    }))
    .add('MKR Token', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            currency: 'MKR',
        }),
    }))
    .add('Hidden Table', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            isTableShown: false,
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

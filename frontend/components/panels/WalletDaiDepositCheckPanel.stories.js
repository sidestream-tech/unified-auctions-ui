import { storiesOf } from '@storybook/vue';
import { action } from '@storybook/addon-actions';
import faker from 'faker';
import BigNumber from 'bignumber.js';
import WalletDaiDepositCheckPanel from '~/components/panels/WalletDaiDepositCheckPanel';

const common = {
    components: { WalletDaiDepositCheckPanel },
    data() {
        return {
            walletDai: new BigNumber(faker.finance.amount(0, 100)),
            desiredAmount: new BigNumber(faker.finance.amount(101, 200)),
            network: 'main',
            tokenAddressDai: faker.finance.ethereumAddress(),
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
        <WalletDaiDepositCheckPanel
            v-bind="$data"
            @refresh="refresh"
            @update:isCorrect="isCorrect"
        />`,
};

storiesOf('Panels/WalletDaiDepositCheckPanel', module)
    .add('Insufficient amount of DAI present', () => ({
        ...common,
    }))
    .add('Sufficient amount of DAI present', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            walletDai: new BigNumber(100),
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
            walletDai: undefined,
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

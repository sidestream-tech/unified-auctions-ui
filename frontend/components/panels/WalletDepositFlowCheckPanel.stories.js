import { storiesOf } from '@storybook/vue';
import { action } from '@storybook/addon-actions';
import faker from 'faker';
import BigNumber from 'bignumber.js';
import WalletDepositFlowCheckPanel from './WalletDepositFlowCheckPanel';

const common = {
    components: { WalletDepositFlowCheckPanel },
    data() {
        return {
            walletAmount: new BigNumber(faker.finance.amount(0, 100)),
            walletVatAmount: new BigNumber(faker.finance.amount(0, 100)),
            desiredAmount: new BigNumber(faker.finance.amount(101, 200)),
            allowanceAmount: new BigNumber(faker.finance.amount(0, 100)),
            network: 'mainnet',
            tokenAddress: faker.finance.ethereumAddress(),
            currency: 'DAI',
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
        setAllowanceAmount(amount) {
            this.isLoading = true;
            setTimeout(() => {
                this.allowanceAmount = amount || new BigNumber(Number.MAX_VALUE);
                this.isLoading = false;
            }, 1000);
        },
        deposit(amount) {
            this.isLoading = true;
            setTimeout(() => {
                this.walletAmount = this.walletAmount.minus(amount);
                this.walletVatAmount = this.walletVatAmount.plus(amount);
                this.isLoading = false;
            }, 1000);
        },
        isCorrect: action('isCorrect'),
    },
    template: `
        <WalletDepositFlowCheckPanel
        v-bind="$data"
        @refresh="refresh"
        @setAllowanceAmount="setAllowanceAmount"
        @deposit="deposit"
        @update:isCorrect="isCorrect"
        />`,
};

storiesOf('Panels/WalletDepositFlowCheckPanel', module)
    .add('Insufficient DAI in wallet', () => ({
        ...common,
    }))
    .add('Sufficient DAI in wallet but unauthorized', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            walletAmount: new BigNumber(5000),
            allowanceAmount: new BigNumber(0),
        }),
    }))
    .add('Sufficient DAI in wallet and authorized', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            walletAmount: new BigNumber(5000),
            allowanceAmount: new BigNumber(Number.MAX_VALUE),
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
            allowanceAmount: undefined,
        }),
    }))
    .add('MKR Token', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            currency: 'MKR',
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

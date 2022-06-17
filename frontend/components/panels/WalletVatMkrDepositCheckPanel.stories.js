import { storiesOf } from '@storybook/vue';
import { action } from '@storybook/addon-actions';
import faker from 'faker';
import BigNumber from 'bignumber.js';
import WalletVatMkrDepositCheckPanel from './WalletVatMkrDepositCheckPanel';

const MAINNET_MKR_TOKEN_ADDRESS = '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2';

const common = {
    components: { WalletVatMkrDepositCheckPanel },
    data() {
        return {
            walletMkr: new BigNumber(faker.finance.amount(0, 100)),
            walletVatMkr: new BigNumber(faker.finance.amount(0, 100)),
            desiredAmount: new BigNumber(faker.finance.amount(101, 200)),
            allowanceAmount: new BigNumber(faker.finance.amount(0, 100)),
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
        setAllowanceAmount(amount) {
            this.isLoading = true;
            setTimeout(() => {
                this.allowanceAmount = amount || new BigNumber(Number.MAX_VALUE);
                this.isLoading = false;
            }, 1000);
        },
        deposit() {
            this.isLoading = true;
            setTimeout(() => {
                this.walletMkr = this.walletMkr.minus(this.desiredAmount);
                this.walletVatMkr = this.walletVatMkr.plus(this.desiredAmount);
                this.isLoading = false;
            }, 1000);
        },
        isCorrect: action('isCorrect'),
    },
    template: `
        <WalletVatMkrDepositCheckPanel
        v-bind="$data"
        @refresh="refresh"
        @setAllowanceAmount="setAllowanceAmount"
        @deposit="deposit"
        @update:isCorrect="isCorrect"
        />`,
};

storiesOf('Panels/WalletVatMkrDepositCheckPanel', module)
    .add('Insufficient MKR in wallet', () => ({
        ...common,
    }))
    .add('Sufficient MKR in wallet but unauthorized', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            walletMkr: new BigNumber(5000),
        }),
    }))
    .add('Sufficient MKR in wallet and authorized', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            walletMkr: new BigNumber(5000),
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
            walletMkr: undefined,
            walletVatMkr: undefined,
            allowanceAmount: undefined,
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

import { storiesOf } from '@storybook/vue';
import { action } from '@storybook/addon-actions';
import faker from 'faker';
import BigNumber from 'bignumber.js';
import WithdrawDAIPanel from './WithdrawDAIPanel';

const common = {
    components: { WithdrawDAIPanel },
    data: () => ({
        daiVatBalance: new BigNumber(faker.finance.amount()),
        walletAddress: faker.finance.ethereumAddress(),
        isWithdrawing: false,
        isAuthorizing: false,
        isWalletAuthorized: false,
        disabled: false,
        isExplanationsShown: true,
        state: 'just-started',
    }),
    methods: {
        withdraw() {
            this.isWithdrawing = true;
            setTimeout(() => {
                this.daiVatBalance = new BigNumber(0);
                this.isWithdrawing = false;
            }, 1000);
        },
        manage: action('openWalletModal'),
        authorize() {
            this.isAuthorizing = true;
            setTimeout(() => {
                this.isWalletAuthorized = true;
                this.isAuthorizing = false;
            }, 1000);
        },
    },
    template: `
    <WithdrawDAIPanel
        v-bind="$data"
        @withdrawAllDaiFromVat="withdraw"
        @manageVat="manage"
        @authorizeWallet="authorize"
    />`,
};

storiesOf('Panels/WithdrawDAIPanel', module)
    .add('Default', () => ({
        ...common,
    }))
    .add('Collected State', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            state: 'collected',
        }),
    }))
    .add('Liquidated State', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            state: 'liquidated',
        }),
    }))
    .add('No DAI In VAT', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            daiVatBalance: new BigNumber(0),
        }),
    }))
    .add('No Wallet', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            walletAddress: '',
        }),
    }))
    .add('No Authorization', () => ({
        ...common,
    }))
    .add('DAI And Authorization Available', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            isWalletAuthorized: true,
        }),
    }))
    .add('Authorizing', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            isAuthorizing: true,
        }),
    }))
    .add('Withdrawing', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            isWithdrawing: true,
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

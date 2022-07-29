import { storiesOf } from '@storybook/vue';
import faker from 'faker';
import BigNumber from 'bignumber.js';
import WithdrawDAIPanel from './WithdrawDAIPanel';

const common = {
    components: { WithdrawDAIPanel },
    data: () => ({
        daiVatBalance: new BigNumber(faker.finance.amount()),
        walletAddress: faker.finance.ethereumAddress(),
        isWithdrawing: false,
        isRefreshing: false,
        isAuthorizing: false,
        isWalletAuthorized: false,
        isExplanationsShown: true,
    }),
    methods: {
        withdraw() {
            this.isWithdrawing = true;
            setTimeout(() => {
                this.daiVatBalance = new BigNumber(0);
                this.isWithdrawing = false;
            }, 1000);
        },
        refresh() {
            this.isRefreshing = true;
            setTimeout(() => {
                this.daiVatBalance = new BigNumber(faker.finance.amount());
                this.isRefreshing = false;
            }, 1000);
        },
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
        @refreshWallet="refresh"
        @authorizeWallet="authorize"
    />`,
};

storiesOf('Panels/WithdrawDAIPanel', module)
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
    .add('Refreshing', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            isRefreshing: true,
        }),
    }))
    .add('Withdrawing', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            isWithdrawing: true,
        }),
    }))
    .add('Expert Mode', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            isExplanationsShown: false,
        }),
    }));

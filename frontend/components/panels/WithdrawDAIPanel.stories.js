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
        isRefreshing: false,
        isAuthorizing: false,
        isWalletAuthorized: false,
        isExplanationsShown: true,
        state: 'just-started',
        secondaryButtonText: 'Refresh DAI balance in VAT',
        explanationText: `After the auction is collected, DAI will end up in the highest bidder's VAT account. One more transaction
            is required to move DAI from VAT to the wallet.`,
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
        @refreshOrManage="refresh"
        @authorizeWallet="authorize"
    />`,
};

storiesOf('Panels/WithdrawDAIPanel', module)
    .add('Surplus Auction', () => ({
        ...common,
    }))
    .add('Vault Liquidation', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            state: 'not-liquidatable',
            secondaryButtonText: 'Manage DAI in VAT',
            explanationText: `After liquidating a vault, the DAI-based liquidation incentive will end up in your VAT account. One more
            transaction is required to move that DAI to your wallet.`,
        }),
        template: `
        <WithdrawDAIPanel
            v-bind="$data"
            @withdrawAllDaiFromVat="withdraw"
            @refreshOrManage="manage"
            @authorizeWallet="authorize"
        />`,
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
            secondaryButtonText: 'Manage DAI in VAT',
            explanationText: `After liquidating a vault, the DAI-based liquidation incentive will end up in your VAT account. One more
            transaction is required to move that DAI to your wallet.`,
        }),
        template: `
        <WithdrawDAIPanel
            v-bind="$data"
            @withdrawAllDaiFromVat="withdraw"
            @refreshOrManage="manage"
            @authorizeWallet="authorize"
        />`,
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

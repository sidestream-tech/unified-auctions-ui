import { storiesOf } from '@storybook/vue';
import { action } from '@storybook/addon-actions';
import faker from 'faker';
import BigNumber from 'bignumber.js';
import WithdrawDaiFromVat from './WithdrawDaiFromVat';

const common = {
    components: { WithdrawDaiFromVat },
    data: () => ({
        daiVatBalance: new BigNumber(faker.finance.amount()),
        walletAddress: faker.finance.ethereumAddress(),
        isWithdrawing: false,
        isAuthorizing: false,
        isWalletAuthorized: false,
        isExplanationsShown: true,
        vaultState: 'liquidated',
    }),
    methods: {
        withdraw() {
            this.isWithdrawing = true;
            setTimeout(() => {
                this.daiVatBalance = new BigNumber(0);
                this.isWithdrawing = false;
            }, 1000);
        },
        authorize() {
            this.isAuthorizing = true;
            setTimeout(() => {
                this.isWalletAuthorized = true;
                this.isAuthorizing = false;
            }, 1000);
        },
        manage: action('openWalletModal'),
    },
    template: `
    <WithdrawDaiFromVat
        v-bind="$data"
        @withdrawAllDaiFromVat="withdraw"
        @authorizeWallet="authorize"
        @manageVat="manage"
    />`,
};

storiesOf('Vault/WithdrawDaiFromVat', module)
    .add('Non Liquidated State', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            vaultState: 'liquidatable',
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
    .add('Expert Mode', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            isExplanationsShown: false,
        }),
    }));

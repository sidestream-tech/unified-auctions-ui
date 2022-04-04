import { storiesOf } from '@storybook/vue';
import { action } from '@storybook/addon-actions';
import faker from 'faker';
import WalletAuthorizationCheckPanel from './WalletAuthorizationCheckPanel';

const common = {
    components: { WalletAuthorizationCheckPanel },
    data() {
        return {
            isWalletAuthorized: false,
            walletAddress: faker.finance.ethereumAddress(),
            isLoading: false,
            disabled: false,
            isExplanationsShown: true,
        };
    },
    methods: {
        authorize() {
            this.isLoading = true;
            setTimeout(() => {
                this.isWalletAuthorized = true;
                this.isLoading = false;
            }, 1000);
        },
        isCorrect: action('isCorrect'),
    },
    template: `
    <WalletAuthorizationCheckPanel
        v-bind="$data"
        @authorizeWallet="authorize"
        @update:isCorrect="isCorrect"
    />`,
};

storiesOf('Panels/WalletAuthorizationCheckPanel', module)
    .add('Authorized', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            isWalletAuthorized: true,
        }),
    }))
    .add('Unauthorized', () => ({
        ...common,
    }))
    .add('Missing Wallet', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            walletAddress: undefined,
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

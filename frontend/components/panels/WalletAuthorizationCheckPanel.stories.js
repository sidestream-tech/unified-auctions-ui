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
            isCorrect: false,
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
    },
    watch: {
        isCorrect: {
            immediate: true,
            handler(isCorrect) {
                action('isCorrect')(isCorrect);
            },
        },
    },
    template: `
    <WalletAuthorizationCheckPanel
        :is-wallet-authorized="isWalletAuthorized"
        :wallet-address="walletAddress"
        :is-loading="isLoading"
        :disabled="disabled"
        :is-correct.sync="isCorrect"
        :is-explanations-shown="isExplanationsShown"
        @authorizeWallet="authorize"
    />`,
};

storiesOf('Panels/WalletAuthorizationCheckPanel', module)
    .add('Authorized', () => ({
        ...common,
        data() {
            return {
                ...common.data(),
                isWalletAuthorized: true,
            };
        },
    }))
    .add('Unauthorized', () => ({
        ...common,
    }))
    .add('Missing Wallet', () => ({
        ...common,
        data() {
            return {
                ...common.data(),
                walletAddress: undefined,
            };
        },
    }))
    .add('Loading', () => ({
        ...common,
        data() {
            return {
                ...common.data(),
                isLoading: true,
            };
        },
    }))
    .add('Disabled', () => ({
        ...common,
        data() {
            return {
                ...common.data(),
                disabled: true,
            };
        },
    }))
    .add('Expert Mode', () => ({
        ...common,
        data() {
            return {
                ...common.data(),
                isExplanationsShown: false,
            };
        },
    }));

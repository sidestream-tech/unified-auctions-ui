import { storiesOf } from '@storybook/vue';
import faker from 'faker';
import WalletAuthorizationCheckPanel from './WalletAuthorizationCheckPanel';

const common = {
    components: { WalletAuthorizationCheckPanel },
    data() {
        return {
            isWalletAuthorized: false,
            isLoading: false,
            walletAddress: faker.finance.ethereumAddress(),
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
};

storiesOf('Panels/WalletAuthorizationCheckPanel', module)
    .add('Authorized', () => ({
        ...common,
        data() {
            return {
                isWalletAuthorized: true,
                walletAddress: faker.finance.ethereumAddress(),
                isLoading: false,
            };
        },
        template: `
        <WalletAuthorizationCheckPanel
            :is-wallet-authorized="isWalletAuthorized"
            :wallet-address="walletAddress"
            :is-loading="isLoading"
            @authorizeWallet="authorize"
        />`,
    }))
    .add('Unauthorized', () => ({
        ...common,
        template: `
        <WalletAuthorizationCheckPanel
            :is-wallet-authorized="isWalletAuthorized"
            :wallet-address="walletAddress"
            :is-loading="isLoading"
            @authorizeWallet="authorize()"
        />`,
    }))
    .add('Missing Wallet', () => ({
        ...common,
        data() {
            return {
                isWalletAuthorized: false,
                walletAddress: undefined,
                isLoading: false,
            };
        },
        template: `
        <WalletAuthorizationCheckPanel
            :is-wallet-authorized="isWalletAuthorized"
            :wallet-address="walletAddress"
            :is-loading="isLoading"
            @authorizeWallet="authorize"
        />`,
    }))
    .add('Loading', () => ({
        ...common,
        template: `
        <WalletAuthorizationCheckPanel
            :is-wallet-authorized="isWalletAuthorized"
            :wallet-address="walletAddress"
            :is-loading="isLoading"
            @authorizeWallet="authorize"
            is-loading
        />`,
    }))
    .add('Disabled', () => ({
        ...common,
        template: `
        <WalletAuthorizationCheckPanel
            :is-wallet-authorized="isWalletAuthorized"
            :wallet-address="walletAddress"
            :is-loading="isLoading"
            @authorizeWallet="authorize"
            disabled
        />`,
    }))
    .add('Expert Mode', () => ({
        ...common,
        template: `
        <WalletAuthorizationCheckPanel
            :is-wallet-authorized="isWalletAuthorized"    
            :wallet-address="walletAddress"
            :is-loading="isLoading"
            @authorizeWallet="authorize"
            :is-explanations-shown="false"
        />`,
    }));

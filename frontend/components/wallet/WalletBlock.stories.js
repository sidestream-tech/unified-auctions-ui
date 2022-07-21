import { storiesOf } from '@storybook/vue';
import faker from 'faker';
import WalletBlock from './WalletBlock';

const common = {
    components: { WalletBlock },
    data() {
        return {
            isLoading: false,
            walletAddress: null,
            demoWalletAddress: faker.finance.ethereumAddress(),
        };
    },
    methods: {
        connectWallet() {
            this.isLoading = true;
            setTimeout(() => {
                this.walletAddress = this.demoWalletAddress;
                this.isLoading = false;
            }, 1000);
        },
        disconnectWallet() {
            this.isLoading = true;
            setTimeout(() => {
                this.walletAddress = null;
                this.isLoading = false;
            }, 1000);
        },
    },
};

storiesOf('Wallet/WalletBlock', module)
    .add('Default', () => ({
        ...common,
        template:
            '<WalletBlock :isLoading="isLoading" :walletAddress="walletAddress" @connectWallet="connectWallet" @disconnectWallet="disconnectWallet"/>',
    }))
    .add('Not Connected', () => ({
        ...common,
        template: '<WalletBlock />',
    }))
    .add('Connecting', () => ({
        ...common,
        template: '<WalletBlock :isLoading="true" />',
    }))
    .add('Connected', () => ({
        ...common,
        template: '<WalletBlock :walletAddress="demoWalletAddress"/>',
    }))
    .add('Disconnecting', () => ({
        ...common,
        template: '<WalletBlock :walletAddress="demoWalletAddress" :isLoading="true" />',
    }));

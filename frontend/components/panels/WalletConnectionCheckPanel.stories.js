import { storiesOf } from '@storybook/vue';
import { action } from '@storybook/addon-actions';
import faker from 'faker';
import WalletConnectionCheckPanel from './WalletConnectionCheckPanel';

const common = {
    components: { WalletConnectionCheckPanel },
    data: () => ({
        walletAddress: null,
        disabled: false,
        isLoading: false,
        isExplanationsShown: true,
    }),
    methods: {
        connectWallet() {
            this.isLoading = true;
            setTimeout(() => {
                this.walletAddress = faker.finance.ethereumAddress();
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
        isCorrect: action('isCorrect'),
    },
    template: `
    <WalletConnectionCheckPanel 
        v-bind="$data"
        @connectWallet="connectWallet"
        @disconnectWallet="disconnectWallet"
        @update:isCorrect="isCorrect"
    />
    `,
};

storiesOf('Panels/WalletConnectionCheckPanel', module)
    .add('Wallet Connected', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            walletAddress: faker.finance.ethereumAddress(),
        }),
    }))
    .add('No Wallet Connected', () => ({
        ...common,
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

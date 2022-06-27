import { storiesOf } from '@storybook/vue';
import faker from 'faker';
import SurplusAuctionRestartPanel from '~/components/panels/SurplusAuctionRestartPanel';

const fakeAddress = faker.finance.ethereumAddress();

const common = {
    components: { SurplusAuctionRestartPanel },
    data() {
        return {
            walletAddress: fakeAddress,
            isRestarting: false,
            isConnecting: false,
            disabled: false,
            isExplanationsShown: true,
        };
    },
    methods: {
        restart() {
            this.isRestarting = true;
            setTimeout(() => {
                this.isRestarting = false;
            }, 1000);
        },
        connectWallet() {
            this.isConnecting = true;
            setTimeout(() => {
                this.isConnecting = false;
                this.walletAddress = fakeAddress;
            }, 1000);
        },
        disconnectWallet() {
            this.isConnecting = true;
            setTimeout(() => {
                this.isConnecting = false;
                this.walletAddress = undefined;
            }, 1000);
        },
    },
    template: `
        <AuctionRestartPanel
            v-bind="$data"
            @restart="restart"
            @connectWallet="connectWallet"
            @disconnectWallet="disconnectWallet"
        />`,
};

storiesOf('Panels/SurplusAuctionRestartPanel', module)
    .add('Inactive Auction', () => ({
        ...common,
    }))
    .add('Expert Mode', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            isExplanationsShown: false,
        }),
    }))
    .add('Disabled', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            disabled: true,
        }),
    }))
    .add('No Wallet Connected', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            walletAddress: undefined,
        }),
    }))
    .add('Wallet Connecting', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            walletAddress: undefined,
            isConnecting: true,
        }),
    }))
    .add('Restarting', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            isRestarting: true,
        }),
    }));

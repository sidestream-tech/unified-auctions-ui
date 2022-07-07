import { storiesOf } from '@storybook/vue';
import faker from 'faker';
import BigNumber from 'bignumber.js';
import SurplusAuctionTransaction from './SurplusAuctionTransaction';
import { generateFakeSurplusAuction } from '~/helpers/generateFakeSurplusAuction';

const fakeSurplusAuction = generateFakeSurplusAuction();

const common = {
    components: { SurplusAuctionTransaction },
    data: () => ({
        auction: {
            ...fakeSurplusAuction,
        },
        isConnecting: false,
        walletAddress: null,
    }),
    methods: {
        connect() {
            this.isConnecting = true;
            setTimeout(() => {
                this.walletAddress = faker.finance.ethereumAddress();
                this.walletDai = new BigNumber(faker.finance.amount());
                this.walletVatDai = new BigNumber(faker.finance.amount());
                this.isConnecting = false;
            }, 1000);
        },
        disconnect() {
            this.isConnecting = true;
            setTimeout(() => {
                this.walletAddress = null;
                this.isWalletAuthorized = false;
                this.authorisedCollaterals = [];
                this.transactionAddress = null;
                this.walletDai = null;
                this.walletVatDai = null;
                this.isConnecting = false;
            }, 1000);
        },
    },
    template: `
    <SurplusAuctionTransaction
        v-bind="$data"
        @connect="connect()"
        @disconnect="disconnect()"
    />`,
};

storiesOf('Transaction/SurplusAuctionTransaction', module).add('Default', () => ({
    ...common,
}));

import { storiesOf } from '@storybook/vue';
import faker from 'faker';
import SwapTransaction from '~/components/transaction/SwapTransaction';
import { generateFakeAuctionTransaction } from '~/helpers/generateFakeAuction';

const fakeAuctionTransaction = generateFakeAuctionTransaction();

const common = {
    components: { SwapTransaction },
    data() {
        return {
            auctionTransaction: fakeAuctionTransaction,
            isConnecting: false,
            isAuthorizing: false,
            isExecuting: false,
            isAuthorised: false,
            walletAddress: null,
            transactionAddress: null,
        };
    },
    methods: {
        connect() {
            this.isConnecting = true;
            setTimeout(() => {
                this.walletAddress = faker.finance.ethereumAddress();
                this.isConnecting = false;
            }, 1000);
        },
        disconnect() {
            this.isConnecting = true;
            setTimeout(() => {
                this.walletAddress = null;
                this.isAuthorised = false;
                this.transactionAddress = null;
                this.isConnecting = false;
            }, 1000);
        },
        authorize() {
            this.isAuthorizing = true;
            setTimeout(() => {
                this.isAuthorised = true;
                this.isAuthorizing = false;
            }, 1000);
        },
        execute() {
            this.isExecuting = true;
            setTimeout(() => {
                this.transactionAddress = faker.finance.ethereumAddress();
                this.isExecuting = false;
            }, 1000);
        },
    },
};

storiesOf('Transaction/SwapTransaction', module).add('Default', () => ({
    ...common,
    template:
        '<SwapTransaction :auction-transaction="auctionTransaction" :isConnecting="isConnecting" :isAuthorizing="isAuthorizing" :isAuthorised="isAuthorised" :isExecuting="isExecuting" :walletAddress="walletAddress" :transactionAddress="transactionAddress" @connect="connect" @disconnect="disconnect" @authorize="authorize" @execute="execute" />',
}));

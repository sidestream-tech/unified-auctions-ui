import { storiesOf } from '@storybook/vue';
import faker from 'faker';
import { action } from '@storybook/addon-actions';
import SwapTransaction from '~/components/transaction/SwapTransaction';
import { generateFakeAuctionTransaction } from '~/helpers/generateFakeAuction';

const fakeAuctionTransaction = generateFakeAuctionTransaction();

const common = {
    components: { SwapTransaction },
    data() {
        return {
            auctionTransaction: {
                ...fakeAuctionTransaction,
                isActive: true,
            },
            isConnecting: false,
            isAuthorizing: false,
            isExecuting: false,
            isWalletAuthorized: false,
            authorisedCollaterals: [],
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
                this.isWalletAuthorized = false;
                this.authorisedCollaterals = [];
                this.transactionAddress = null;
                this.isConnecting = false;
            }, 1000);
        },
        authorizeWallet() {
            this.isAuthorizing = true;
            setTimeout(() => {
                this.isWalletAuthorized = true;
                this.isAuthorizing = false;
            }, 1000);
        },
        authorizeCollateral(collateralType) {
            this.isAuthorizing = true;
            setTimeout(() => {
                this.authorisedCollaterals.push(collateralType);
                this.isAuthorizing = false;
                action('Authorized Collateral:')(collateralType);
            }, 1000);
        },
        execute() {
            this.isExecuting = true;
            setTimeout(() => {
                this.auctionTransaction.transactionAddress = faker.finance.ethereumAddress();
                this.isExecuting = false;
            }, 1000);
        },
    },
};

storiesOf('Transaction/SwapTransaction', module)
    .add('Default', () => ({
        ...common,
        template:
            '<SwapTransaction :auction-transaction="auctionTransaction" :isConnecting="isConnecting" :isAuthorizing="isAuthorizing" :isWalletAuthorized="isWalletAuthorized" :authorisedCollaterals="authorisedCollaterals" :isExecuting="isExecuting" :walletAddress="walletAddress" @connect="connect" @disconnect="disconnect" @authorizeCollateral="authorizeCollateral" @authorizeWallet="authorizeWallet" @execute="execute" />',
    }))
    .add('Inactive Auction', () => ({
        components: { SwapTransaction },
        data() {
            return {
                auctionTransaction: {
                    ...fakeAuctionTransaction,
                    isActive: false,
                },
            };
        },
        template: '<SwapTransaction :auction-transaction="auctionTransaction"/>',
    }));

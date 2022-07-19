import { storiesOf } from '@storybook/vue';
import faker from 'faker';
import { action } from '@storybook/addon-actions';
import CollateralAuctionSwapTransaction from './CollateralAuctionSwapTransaction';
import { generateFakeAuctionTransaction } from '~/helpers/generateFakeAuction';

const fakeAuctionTransaction = generateFakeAuctionTransaction();

const common = {
    components: { CollateralAuctionSwapTransaction },
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

storiesOf('Auction/Collateral/CollateralAuctionSwapTransaction', module)
    .add('Default', () => ({
        ...common,
        template:
            '<CollateralAuctionSwapTransaction :auction-transaction="auctionTransaction" :isConnecting="isConnecting" :isAuthorizing="isAuthorizing" :isWalletAuthorized="isWalletAuthorized" :authorisedCollaterals="authorisedCollaterals" :isExecuting="isExecuting" :walletAddress="walletAddress" @connect="connect" @disconnect="disconnect" @authorizeCollateral="authorizeCollateral" @authorizeWallet="authorizeWallet" @execute="execute" />',
    }))
    .add('Inactive Auction', () => ({
        components: { CollateralAuctionSwapTransaction },
        data() {
            return {
                auctionTransaction: {
                    ...fakeAuctionTransaction,
                    isActive: false,
                },
            };
        },
        template: '<CollateralAuctionSwapTransaction :auction-transaction="auctionTransaction"/>',
    }));

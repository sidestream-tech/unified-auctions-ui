import { storiesOf } from '@storybook/vue';
import faker from 'faker';
import { action } from '@storybook/addon-actions';
import BigNumber from 'bignumber.js';
import BidTransaction from './BidTransaction';
import { generateFakeAuctionTransaction } from '~/helpers/generateFakeAuction';

const fakeAuctionTransaction = generateFakeAuctionTransaction();

const data = {
    auctionTransaction: {
        ...fakeAuctionTransaction,
        isActive: true,
        isFinished: false,
    },
    isConnecting: false,
    isAuthorizing: false,
    isExecuting: false,
    isWalletAuthorised: false,
    authorisedCollaterals: [],
    walletAddress: null,
    walletDai: new BigNumber(faker.finance.amount()),
    walletVatDai: new BigNumber(faker.finance.amount()),
    transactionAddress: null,
    transactionBidAmount: fakeAuctionTransaction.totalPrice,
};

const common = {
    components: { BidTransaction },
    data() {
        return data;
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
                this.isWalletAuthorised = false;
                this.authorisedCollaterals = [];
                this.transactionAddress = null;
                this.isConnecting = false;
            }, 1000);
        },
        authorizeWallet() {
            this.isAuthorizing = true;
            setTimeout(() => {
                this.isWalletAuthorised = true;
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
                this.auctionTransaction.isFinished = true;
                this.auctionTransaction.endDate = new Date();
                this.auctionTransaction.transactionAddress = faker.finance.ethereumAddress();
                this.walletVatDai = this.walletVatDai.minus(this.transactionBidAmount);
                this.isExecuting = false;
            }, 1000);
        },
        deposit() {
            this.walletVatDai = this.transactionBidAmount;
        },
    },
    template: `
    <BidTransaction
        :auctionTransaction="auctionTransaction"
        :isConnecting="isConnecting"
        :isAuthorizing="isAuthorizing"
        :isExecuting="isExecuting"
        :isWalletAuthorised="isWalletAuthorised"
        :authorisedCollaterals="authorisedCollaterals"
        :walletAddress="walletAddress"
        :walletDai="walletDai"
        :walletVatDai="walletVatDai"
        @connect="connect()"
        @disconnect="disconnect()"
        @authorizeWallet="authorizeWallet()"
        @authorizeCollateral="authorizeCollateral($event)"
        @execute="execute()"
        @manageVat="deposit()"
    />`,
};

storiesOf('Transaction/BidTransaction', module)
    .add('Default', () => ({
        ...common,
    }))
    .add('Inactive', () => ({
        ...common,
        data() {
            return {
                ...data,
                auctionTransaction: {
                    ...fakeAuctionTransaction,
                    isActive: false,
                    isFinished: false,
                },
                transactionBidAmount: undefined,
            };
        },
    }))
    .add('Finished', () => ({
        ...common,
        data() {
            return {
                ...data,
                auctionTransaction: {
                    ...fakeAuctionTransaction,
                    isFinished: true,
                    isActive: true,
                    transactionAddress: faker.finance.ethereumAddress(),
                },
                transactionBidAmount: undefined,
            };
        },
    }));

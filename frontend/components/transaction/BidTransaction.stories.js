import { storiesOf } from '@storybook/vue';
import faker from 'faker';
import { action } from '@storybook/addon-actions';
import BigNumber from 'bignumber.js';
import BidTransaction from './BidTransaction';
import { generateFakeAuctionTransaction } from '~/helpers/generateFakeAuction';

const fakeAuctionTransaction = generateFakeAuctionTransaction();

const common = {
    components: { BidTransaction },
    data() {
        return {
            auctionTransaction: {
                ...fakeAuctionTransaction,
                isActive: true,
                isFinished: false,
            },
            isConnecting: false,
            isGrantingAccess: false,
            isDepositing: false,
            isAuthorizing: false,
            isExecuting: false,
            isWalletAuthorised: false,
            isDaiAccessGranted: false,
            isDeposited: false,
            authorisedCollaterals: [],
            walletAddress: null,
            walletDai: new BigNumber(faker.finance.amount()),
            walletVatDai: new BigNumber(faker.finance.amount()),
            transactionAddress: null,
            transactionAmountDai: fakeAuctionTransaction.totalPrice,
            minimumBidDai: new BigNumber(faker.finance.amount()),
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
                this.isWalletAuthorised = false;
                this.authorisedCollaterals = [];
                this.transactionAddress = null;
                this.isConnecting = false;
            }, 1000);
        },
        grantDaiAccess() {
            this.isGrantingAccess = true;
            setTimeout(() => {
                this.isDaiAccessGranted = true;
                this.isGrantingAccess = false;
            }, 1000);
        },
        deposit(amount) {
            this.isDepositing = true;
            setTimeout(() => {
                this.walletDai = this.walletDai?.minus(new BigNumber(amount));
                this.walletVatDai = this.walletVatDai.plus(new BigNumber(amount));
                this.isDepositing = false;
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
                this.auctionTransaction.transactionAddress = faker.finance.ethereumAddress();
                this.isExecuting = false;
            }, 1000);
        },
        setTransactionAmountDAI(amount) {
            this.transactionAmountDai = amount;
        },
    },
};

storiesOf('Transaction/BidTransaction', module).add('Default', () => ({
    ...common,
    template: `
    <BidTransaction
        :auctionTransaction="auctionTransaction"
        :isConnecting="isConnecting"
        :isGrantingAccess="isGrantingAccess"
        :isDepositing="isDepositing"
        :isAuthorizing="isAuthorizing"
        :isExecuting="isExecuting"
        :isWalletAuthorised="isWalletAuthorised"
        :isDaiAccessGranted="isDaiAccessGranted"
        :authorisedCollaterals="authorisedCollaterals"
        :walletAddress="walletAddress"
        :walletDai="walletDai"
        :walletVatDai="walletVatDai"
        :transactionAmountDai="transactionAmountDai"
        :minimumBidDai="minimumBidDai"
        @inputBidAmount="setTransactionAmountDAI($event)"
        @connect="connect()"
        @disconnect="disconnect()"
        @grantDaiAccess="grantDaiAccess()"
        @deposit="deposit($event)"
        @authorizeWallet="authorizeWallet()"
        @authorizeCollateral="authorizeCollateral($event)"
        @execute="execute()"
    />`,
}));

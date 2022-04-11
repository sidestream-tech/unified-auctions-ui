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
    isDepositingOrWithdrawing: false,
    isAuthorizingWallet: false,
    isAuthorizingCollateral: false,
    isExecuting: false,
    isWalletAuthorized: false,
    isDeposited: false,
    authorisedCollaterals: [],
    walletAddress: null,
    walletDai: null,
    walletVatDai: null,
    transactionAddress: null,
    transactionAmountDai: fakeAuctionTransaction.totalPrice,
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
        authorizeWallet() {
            this.isAuthorizingWallet = true;
            setTimeout(() => {
                this.isWalletAuthorized = true;
                this.isAuthorizingWallet = false;
            }, 1000);
        },
        authorizeCollateral(collateralType) {
            this.isAuthorizingCollateral = true;
            setTimeout(() => {
                this.authorisedCollaterals.push(collateralType);
                this.isAuthorizingCollateral = false;
                action('Authorized Collateral:')(collateralType);
            }, 1000);
        },
        execute() {
            this.isExecuting = true;
            setTimeout(() => {
                this.auctionTransaction.isFinished = true;
                this.auctionTransaction.endDate = new Date();
                this.auctionTransaction.transactionAddress = faker.finance.ethereumAddress();
                this.walletVatDai = this.walletVatDai.minus(this.transactionAmountDai);
                this.isExecuting = false;
            }, 1000);
        },
        deposit() {
            this.isDepositingOrWithdrawing = true;
            setTimeout(() => {
                this.walletVatDai = this.transactionAmountDai;
                this.isDepositingOrWithdrawing = false;
            }, 1000);
        },
    },
    template: `
    <BidTransaction
        v-bind="$data"
        @connect="connect()"
        @disconnect="disconnect()"
        @authorizeWallet="authorizeWallet()"
        @authorizeCollateral="authorizeCollateral($event)"
        @bidWithDai="execute()"
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
                transactionAmountDai: undefined,
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
                transactionAmountDai: undefined,
            };
        },
    }));

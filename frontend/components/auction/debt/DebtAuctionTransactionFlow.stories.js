import { storiesOf } from '@storybook/vue';
import faker from 'faker';
import BigNumber from 'bignumber.js';
import { action } from '@storybook/addon-actions';
import DebtAuctionTransactionFlow from './DebtAuctionTransactionFlow';
import { generateFakeDebtAuctionTransaction } from '~/helpers/generateFakeDebtAuction';

const collectAuction = generateFakeDebtAuctionTransaction('ready-for-collection');

const common = {
    components: { DebtAuctionTransactionFlow },
    data: () => ({
        auction: generateFakeDebtAuctionTransaction('have-bids'),
        network: 'mainnet',
        tokenAddress: faker.finance.ethereumAddress(),

        isWalletConnected: false,
        isConnectingWallet: false,
        isRefreshingWallet: false,
        isWalletAuthorized: false,
        isSettingAllowance: false,
        isAuthorizing: false,
        isDepositing: false,

        walletDai: undefined,
        walletVatDai: undefined,
        allowanceDai: undefined,
        walletAddress: undefined,

        amount: new BigNumber(faker.finance.amount(1, 2)),

        auctionActionState: undefined,
    }),
    methods: {
        connect() {
            this.isConnectingWallet = true;
            setTimeout(() => {
                this.walletDai = new BigNumber(faker.finance.amount(1001, 1200));
                this.allowanceDai = new BigNumber(faker.finance.amount(1, 2));
                this.walletVatDai = new BigNumber(faker.finance.amount(100, 200));
                this.walletAddress = faker.finance.ethereumAddress();
                this.isWalletConnected = true;
                this.isConnectingWallet = false;
            }, 1000);
        },
        disconnect() {
            this.isConnectingWallet = true;
            setTimeout(() => {
                this.walletDai = undefined;
                this.allowanceDai = undefined;
                this.walletVatDai = undefined;
                this.walletAddress = undefined;
                this.isWalletConnected = false;
                this.isConnectingWallet = false;
            }, 1000);
        },
        authorizeWallet() {
            this.isAuthorizing = true;
            setTimeout(() => {
                this.isWalletAuthorized = true;
                this.isAuthorizing = false;
            }, 1000);
        },
        deposit(amount) {
            this.isDepositing = true;
            setTimeout(() => {
                this.walletDai = this.walletDai.minus(amount);
                this.walletVatDai = this.walletVatDai.plus(amount);
                this.isDepositing = false;
            }, 1000);
        },
        setAllowanceAmount() {
            this.isSettingAllowance = true;
            setTimeout(() => {
                this.allowanceDai = new BigNumber(faker.finance.amount(800, 1000));
                this.isSettingAllowance = false;
            }, 1000);
        },
        refresh() {
            this.isRefreshingWallet = true;
            setTimeout(() => {
                this.isRefreshingWallet = false;
            }, 1000);
        },
        bid(amount) {
            this.auctionActionState = 'bidding';
            setTimeout(() => {
                this.auction = {
                    ...this.auction,
                    receiverAddress: this.walletAddress,
                    receiveAmountMKR: amount,
                };
                action('bid', amount);
                this.auctionActionState = undefined;
            }, 1000);
        },
        collect() {
            this.auctionActionState = 'collecting';
            setTimeout(() => {
                this.auction.state = 'collected';
                this.auctionActionState = undefined;
            }, 1000);
        },
    },
    template: `
        <DebtAuctionTransactionFlow 
          v-bind="$data" 
          @connectWallet="connect" 
          @disconnectWallet="disconnect" 
          @setAllowanceAmount="setAllowanceAmount" 
          @deposit="deposit"
          @refreshWallet="refresh" 
          @bid="bid(amount)"
          @collect="collect"
          @authorizeWallet="authorizeWallet"
        />`,
};

storiesOf('Auction/Debt/DebtAuctionTransactionFlow', module)
    .add('Default', () => ({
        ...common,
    }))
    .add('Enough DAI in VAT', () => ({
        ...common,
        methods: {
            ...common.methods,
            connect() {
                this.isConnectingWallet = true;
                setTimeout(() => {
                    this.walletDai = new BigNumber(faker.finance.amount(1001, 1200));
                    this.allowanceDai = new BigNumber(faker.finance.amount(1200, 1300));
                    this.walletVatDai = new BigNumber(faker.finance.amount(1000, 2000));
                    this.walletAddress = faker.finance.ethereumAddress();
                    this.isWalletConnected = true;
                    this.isConnectingWallet = false;
                }, 1000);
            },
        },
    }))
    .add('Not enough DAI in wallet', () => ({
        ...common,
        methods: {
            ...common.methods,
            connect() {
                this.isConnectingWallet = true;
                setTimeout(() => {
                    this.walletDai = new BigNumber(1);
                    this.allowanceDai = new BigNumber(faker.finance.amount(1, 2));
                    this.walletVatDai = new BigNumber(0);
                    this.walletAddress = faker.finance.ethereumAddress();
                    this.isWalletConnected = true;
                    this.isConnectingWallet = false;
                }, 1000);
            },
            refresh() {
                this.isRefreshingWallet = true;
                setTimeout(() => {
                    this.walletDai = new BigNumber(faker.finance.amount(1001, 1200));
                    this.allowanceDai = new BigNumber(faker.finance.amount(1, 2));
                    this.walletVatDai = new BigNumber(faker.finance.amount(100, 200));
                    this.isRefreshingWallet = false;
                }, 1000);
            },
        },
    }))
    .add('Ready for collection', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            auction: collectAuction,
            walletAddress: collectAuction.receiverAddress,
            walletMKR: new BigNumber(faker.finance.amount(10, 20)),
            allowanceMKR: new BigNumber(faker.finance.amount(1, 2)),
        }),
    }))
    .add('Requires Restart', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            auction: generateFakeDebtAuctionTransaction('requires-restart'),
        }),
    }))
    .add('No DAI In VAT', () => ({
        ...common,
        methods: {
            ...common.methods,
            connect() {
                this.isConnectingWallet = true;
                setTimeout(() => {
                    this.walletDai = new BigNumber(faker.finance.amount(1001, 1200));
                    this.allowanceDai = new BigNumber(faker.finance.amount(1, 2));
                    this.walletVatDai = new BigNumber(0);
                    this.walletAddress = faker.finance.ethereumAddress();
                    this.isWalletConnected = true;
                    this.isConnectingWallet = false;
                }, 1000);
            },
        },
    }))
    .add('Collected', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            auction: generateFakeDebtAuctionTransaction('collected'),
        }),
    }));

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
        isDebtAuctionAuthorized: false,
        isSettingAllowance: false,
        isAuthorizing: false,
        isDepositing: false,

        walletDai: undefined,
        walletVatDai: undefined,
        allowanceDai: undefined,
        walletAddress: undefined,

        auctionActionState: undefined,
    }),
    methods: {
        connect() {
            action('connect');
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
            action('disconnect');
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
        deposit(amount) {
            action('deposit', amount);
            this.isDepositing = true;
            setTimeout(() => {
                this.walletDai = this.walletDai.minus(amount);
                this.walletVatDai = this.walletVatDai.plus(amount);
                this.isDepositing = false;
            }, 1000);
        },
        setAllowanceAmount(amount) {
            action('setAllowanceAmount', amount);
            this.isSettingAllowance = true;
            setTimeout(() => {
                this.allowanceDai = new BigNumber(faker.finance.amount(800, 1000));
                this.isSettingAllowance = false;
            }, 1000);
        },
        refresh() {
            action('refresh');
            this.isRefreshingWallet = true;
            setTimeout(() => {
                this.isRefreshingWallet = false;
            }, 1000);
        },
        bid(data) {
            action('bid', data);
            this.auctionActionState = 'bidding';
            setTimeout(() => {
                this.auctionActionState = undefined;
                this.auction = {
                    ...this.auction,
                    receiverAddress: this.walletAddress,
                    receiveAmountMKR: data.desiredMkrAmount,
                    state: 'ready-for-collection',
                };
                action('bid', desiredMkrAmount);
            }, 1000);
        },
        collect() {
            action('collect');
            this.auctionActionState = 'collecting';
            setTimeout(() => {
                this.auctionActionState = undefined;
                this.auction.state = 'collected';
            }, 1000);
        },
    },
    template: `<DebtAuctionTransactionFlow
        v-bind="$data"
        @connectWallet="connect"
        @disconnectWallet="disconnect"
        @setAllowanceAmount="setAllowanceAmount"
        @deposit="deposit"
        @refreshWallet="refresh"
        @bid="bid"
        @collect="collect"
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
                    this.walletDai = new BigNumber(faker.finance.amount(500001, 500200));
                    this.allowanceDai = new BigNumber(faker.finance.amount(500200, 500300));
                    this.walletVatDai = new BigNumber(faker.finance.amount(500000, 502000));
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
            walletDai: new BigNumber(faker.finance.amount(500000, 600000)),
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

import { storiesOf } from '@storybook/vue';
import faker from 'faker';
import BigNumber from 'bignumber.js';
import { action } from '@storybook/addon-actions';
import SurplusAuctionTransactionFlow from './SurplusAuctionTransactionFlow';
import { generateFakeSurplusAuctionTransaction } from '~/helpers/generateFakeSurplusAuction';

const collectAuction = generateFakeSurplusAuctionTransaction('ready-for-collection');

const common = {
    components: { SurplusAuctionTransactionFlow },
    data: () => ({
        auction: generateFakeSurplusAuctionTransaction('have-bids'),
        network: 'mainnet',
        tokenAddress: faker.finance.ethereumAddress(),

        isWalletConnected: false,
        isConnectingWallet: false,
        isRefreshingWallet: false,
        isWalletAuthorized: false,

        walletMKR: undefined,
        allowanceMKR: undefined,
        walletAddress: undefined,
        isSettingAllowance: false,
        isAuthorizing: false,

        amount: new BigNumber(faker.finance.amount(1, 2)),
        daiVatBalance: undefined,

        auctionActionState: undefined,
    }),
    methods: {
        connect() {
            this.isConnectingWallet = true;
            setTimeout(() => {
                this.walletMKR = new BigNumber(faker.finance.amount(1001, 1200));
                this.allowanceMKR = new BigNumber(faker.finance.amount(1, 2));
                this.daiVatBalance = new BigNumber(faker.finance.amount(100, 200));
                this.walletAddress = faker.finance.ethereumAddress();
                this.isWalletConnected = true;
                this.isConnectingWallet = false;
            }, 1000);
        },
        disconnect() {
            this.isConnectingWallet = true;
            setTimeout(() => {
                this.walletMKR = undefined;
                this.allowanceMKR = undefined;
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
        setAllowanceAmount() {
            this.isSettingAllowance = true;
            setTimeout(() => {
                this.allowanceMKR = new BigNumber(faker.finance.amount(800, 1000));
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
                    bidAmountMKR: amount,
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
        <SurplusAuctionTransactionFlow 
          v-bind="$data" 
          @connectWallet="connect" 
          @disconnectWallet="disconnect" 
          @setAllowanceAmount="setAllowanceAmount" 
          @refreshWallet="refresh" 
          @bid="bid(amount)"
          @collect="collect"
          @authorizeWallet="authorizeWallet"
        />`,
};

storiesOf('Auction/Surplus/SurplusAuctionTransactionFlow', module)
    .add('Default', () => ({
        ...common,
    }))
    .add('Not enough MKR in wallet', () => ({
        ...common,
        methods: {
            ...common.methods,
            connect() {
                this.isConnectingWallet = true;
                setTimeout(() => {
                    this.walletMKR = new BigNumber(0);
                    this.allowanceMKR = new BigNumber(faker.finance.amount(1, 2));
                    this.walletAddress = faker.finance.ethereumAddress();
                    this.isWalletConnected = true;
                    this.isConnectingWallet = false;
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
            auction: generateFakeSurplusAuctionTransaction('requires-restart'),
        }),
    }))
    .add('No DAI In VAT', () => ({
        ...common,
        methods: {
            ...common.methods,
            connect() {
                this.isConnectingWallet = true;
                setTimeout(() => {
                    this.walletMKR = new BigNumber(faker.finance.amount(1001, 1200));
                    this.allowanceMKR = new BigNumber(faker.finance.amount(1, 2));
                    this.daiVatBalance = new BigNumber(0);
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
            auction: generateFakeSurplusAuctionTransaction('collected'),
        }),
    }));

import { storiesOf } from '@storybook/vue';
import faker from 'faker';
import BigNumber from 'bignumber.js';
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
        isSettingAllowance: false,
        isWalletAuthorized: false,
        isAuthorizing: false,

        walletAddress: undefined,
        walletMKR: undefined,
        allowanceMKR: undefined,
        daiVatBalance: undefined,

        surplusAuctionActionState: 'loaded',
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
        setAllowanceAmount(amount) {
            this.isSettingAllowance = true;
            setTimeout(() => {
                this.allowanceMKR = new BigNumber(amount);
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
            this.surplusAuctionActionState = 'bidding';
            setTimeout(() => {
                this.auction = {
                    ...this.auction,
                    receiverAddress: this.walletAddress,
                    bidAmountMKR: new BigNumber(amount),
                };
                action('bid', amount);
                this.surplusAuctionActionState = 'loaded';
            }, 1000);
        },
        collect() {
            this.surplusAuctionActionState = 'collecting';
            setTimeout(() => {
                this.auction.state = 'collected';
                this.surplusAuctionActionState = 'loaded';
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
          @bid="bid"
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
                    this.walletMKR = new BigNumber(faker.finance.amount(0, this.auction.bidAmountMKR.toNumber()));
                    this.allowanceMKR = new BigNumber(faker.finance.amount(0, this.walletMKR.toNumber()));
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

import { storiesOf } from '@storybook/vue';
import faker from 'faker';
import BigNumber from 'bignumber.js';
import { action } from '@storybook/addon-actions';
import SurplusAuctionTransaction from './SurplusAuctionTransactionFlow';
import { generateFakeSurplusAuctionTransaction } from '~/helpers/generateFakeSurplusAuction';

const collectAuction = generateFakeSurplusAuctionTransaction('ready-for-collection');

const common = {
    components: { SurplusAuctionTransaction },
    data: () => ({
        auction: generateFakeSurplusAuctionTransaction('have-bids'),
        network: 'mainnet',
        tokenAddress: faker.finance.ethereumAddress(),

        walletMKR: undefined,
        allowanceMKR: undefined,
        walletAddress: undefined,

        isConnectingWallet: false,
        isRefreshingWallet: false,
        isSettingAllowance: false,
        isBidding: false,
        isCollecting: false,
    }),
    methods: {
        connect() {
            this.isConnectingWallet = true;
            setTimeout(() => {
                this.walletMKR = new BigNumber(faker.finance.amount(1001, 1200));
                this.allowanceMKR = new BigNumber(faker.finance.amount(1, 2));
                this.walletAddress = faker.finance.ethereumAddress();
                this.isConnectingWallet = false;
            }, 1000);
        },
        disconnect() {
            this.isConnectingWallet = true;
            setTimeout(() => {
                this.walletMKR = undefined;
                this.allowanceMKR = undefined;
                this.walletAddress = undefined;
                this.isConnectingWallet = false;
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
            this.isBidding = true;
            setTimeout(() => {
                this.isBidding = false;
                this.auction = {
                    ...this.auction,
                    receiverAddress: this.walletAddress,
                    bidAmountMKR: amount,
                };
                action('bid', amount);
            }, 1000);
        },
        collect() {
            this.isCollecting = true;
            setTimeout(() => {
                this.isCollecting = false;
            }, 1000);
        },
    },
    template: `
        <SurplusAuctionTransaction 
          v-bind="$data" 
          @connect="connect" 
          @disconnect="disconnect" 
          @setAllowanceAmount="setAllowanceAmount" 
          @refresh="refresh" 
          @bid="bid"
          @collect="collect"
        />`,
};

storiesOf('Surplus/SurplusAuctionTransactionFlow', module)
    .add('Default', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            auction: generateFakeSurplusAuctionTransaction('have-bids'),
        }),
    }))
    .add('Not enough MKR in wallet', () => ({
        ...common,
        methods: {
            ...common.methods,
            connect() {
                this.isConnectingWallet = true;
                setTimeout(() => {
                    this.walletMKR = new BigNumber(faker.finance.amount(1, 2));
                    this.allowanceMKR = new BigNumber(faker.finance.amount(1, 2));
                    this.walletAddress = faker.finance.ethereumAddress();
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
    .add('Collected', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            auction: generateFakeSurplusAuctionTransaction('collected'),
        }),
    }));

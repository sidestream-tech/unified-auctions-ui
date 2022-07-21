import { storiesOf } from '@storybook/vue';
import { action } from '@storybook/addon-actions';
import faker from 'faker';
import BigNumber from 'bignumber.js';
import CollateralAuctionBidTransactionTable from './CollateralAuctionBidTransactionTable';
import { generateFakeAuctionTransaction } from '~/helpers/generateFakeAuction';

const fakeAuction = generateFakeAuctionTransaction();

const common = {
    template: `<CollateralAuctionBidTransactionTable
        :auctionTransaction="auctionTransaction"
        :amountToReceive="amountToReceive"
        @inputBidAmount="inputBidAmount"
    />`,
    components: { CollateralAuctionBidTransactionTable },
    data() {
        return {
            auctionTransaction: {
                ...fakeAuction,
                isFinished: false,
                isActive: true,
            },
            amountToReceive: new BigNumber(NaN),
        };
    },
    methods: {
        inputBidAmount: action('inputBidAmount'),
    },
};

storiesOf('Auction/Collateral/CollateralAuctionBidTransactionTable', module)
    .add('Default', () => ({
        ...common,
    }))
    .add('Finished', () => ({
        ...common,
        data() {
            return {
                auctionTransaction: {
                    ...fakeAuction,
                    isFinished: true,
                    totalPrice: null,
                },
                amountToReceive: new BigNumber(NaN),
            };
        },
    }))
    .add('Inactive', () => ({
        ...common,
        data() {
            return {
                auctionTransaction: {
                    ...fakeAuction,
                    isActive: false,
                    isFinished: false,
                    totalPrice: null,
                },
                amountToReceive: new BigNumber(NaN),
            };
        },
    }))
    .add('Total < Minimum x 2', () => ({
        ...common,
        data() {
            return {
                auctionTransaction: {
                    ...fakeAuction,
                    isActive: true,
                    isFinished: false,
                    totalPrice: new BigNumber(faker.finance.amount(60, 99)),
                    minimumBidDai: new BigNumber(faker.finance.amount(50, 60)),
                },
                amountToReceive: new BigNumber(NaN),
            };
        },
    }))
    .add('Decreasing Price', () => ({
        ...common,
        data() {
            return {
                auctionTransaction: {
                    ...fakeAuction,
                    isActive: true,
                    isFinished: false,
                },
                amountToReceive: new BigNumber(NaN),
            };
        },
        created() {
            setInterval(() => {
                this.auctionTransaction.totalPrice = this.auctionTransaction.totalPrice.multipliedBy(0.99);
            }, 5000);
        },
    }))
    .add('Decreasing Into Disabled Input', () => ({
        ...common,
        data() {
            return {
                auctionTransaction: {
                    ...fakeAuction,
                    isActive: true,
                    isFinished: false,
                    totalPrice: new BigNumber(faker.finance.amount(50, 51)),
                    minimumBidDai: new BigNumber(faker.finance.amount(25, 25)),
                },
                amountToReceive: new BigNumber(NaN),
            };
        },
        created() {
            setInterval(() => {
                this.auctionTransaction.totalPrice = this.auctionTransaction.totalPrice.multipliedBy(0.99);
            }, 5000);
        },
    }));

import { storiesOf } from '@storybook/vue';
import faker from 'faker';
import BigNumber from 'bignumber.js';
import BidTransactionTable from './BidTransactionTable';
import { generateFakeAuctionTransaction } from '~/helpers/generateFakeAuction';

const fakeAuction = generateFakeAuctionTransaction();

const common = {
    components: { BidTransactionTable },
    data() {
        return {
            auctionTransaction: {
                ...fakeAuction,
                isFinished: false,
                isActive: true,
            },
            minimumBidDai: new BigNumber(faker.finance.amount(0, 50)),
        };
    },
};

storiesOf('Transaction/BidTransactionTable', module)
    .add('Default', () => ({
        ...common,
        template: '<BidTransactionTable :auctionTransaction="auctionTransaction" :minimumBidDai="minimumBidDai" />',
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
                minimumBidDai: new BigNumber(faker.finance.amount(0, 50)),
            };
        },
        template: '<BidTransactionTable :auctionTransaction="auctionTransaction" :minimumBidDai="minimumBidDai" />',
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
                minimumBidDai: new BigNumber(faker.finance.amount(0, 50)),
            };
        },
        template: '<BidTransactionTable :auctionTransaction="auctionTransaction" :minimumBidDai="minimumBidDai" />',
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
                },
                minimumBidDai: new BigNumber(faker.finance.amount(50, 60)),
            };
        },
        template: '<BidTransactionTable :auctionTransaction="auctionTransaction" :minimumBidDai="minimumBidDai" />',
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
                minimumBidDai: new BigNumber(faker.finance.amount(0, 50)),
            };
        },
        created() {
            setInterval(() => {
                this.auctionTransaction.totalPrice = this.auctionTransaction.totalPrice.multipliedBy(0.99);
            }, 5000);
        },
        template: '<BidTransactionTable :auctionTransaction="auctionTransaction" :minimumBidDai="minimumBidDai" />',
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
                },
                minimumBidDai: new BigNumber(faker.finance.amount(25, 25)),
            };
        },
        created() {
            setInterval(() => {
                this.auctionTransaction.totalPrice = this.auctionTransaction.totalPrice.multipliedBy(0.99);
            }, 5000);
        },
        template: '<BidTransactionTable :auctionTransaction="auctionTransaction" :minimumBidDai="minimumBidDai" />',
    }));

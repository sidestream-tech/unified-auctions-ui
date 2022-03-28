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
        };
    },
};

storiesOf('Transaction/BidTransactionTable', module)
    .add('Default', () => ({
        ...common,
        template: '<BidTransactionTable :auctionTransaction="auctionTransaction" />',
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
            };
        },
        template: '<BidTransactionTable :auctionTransaction="auctionTransaction" />',
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
            };
        },
        template: '<BidTransactionTable :auctionTransaction="auctionTransaction" />',
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
            };
        },
        template: '<BidTransactionTable :auctionTransaction="auctionTransaction" />',
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
            };
        },
        created() {
            setInterval(() => {
                this.auctionTransaction.totalPrice = this.auctionTransaction.totalPrice.multipliedBy(0.99);
            }, 5000);
        },
        template: '<BidTransactionTable :auctionTransaction="auctionTransaction" />',
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
            };
        },
        created() {
            setInterval(() => {
                this.auctionTransaction.totalPrice = this.auctionTransaction.totalPrice.multipliedBy(0.99);
            }, 5000);
        },
        template: '<BidTransactionTable :auctionTransaction="auctionTransaction" />',
    }));

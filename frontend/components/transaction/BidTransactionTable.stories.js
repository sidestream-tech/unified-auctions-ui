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
            minimumDepositDAI: new BigNumber(faker.finance.amount(0, 50)),
        };
    },
};

storiesOf('Transaction/BidTransactionTable', module)
    .add('Default', () => ({
        ...common,
        template:
            '<BidTransactionTable :auctionTransaction="auctionTransaction" :minimumDepositDai="minimumDepositDAI" />',
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
                minimumDepositDAI: new BigNumber(faker.finance.amount(0, 50)),
            };
        },
        template:
            '<BidTransactionTable :auctionTransaction="auctionTransaction" :minimumDepositDai="minimumDepositDAI" />',
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
                minimumDepositDAI: new BigNumber(faker.finance.amount(0, 50)),
            };
        },
        template:
            '<BidTransactionTable :auctionTransaction="auctionTransaction" :minimumDepositDai="minimumDepositDAI" />',
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
                minimumDepositDAI: new BigNumber(faker.finance.amount(50, 60)),
            };
        },
        template:
            '<BidTransactionTable :auctionTransaction="auctionTransaction" :minimumDepositDai="minimumDepositDAI" />',
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
                minimumDepositDAI: new BigNumber(faker.finance.amount(0, 50)),
            };
        },
        created() {
            setInterval(() => {
                this.auctionTransaction.totalPrice = this.auctionTransaction.totalPrice.multipliedBy(0.99);
            }, 5000);
        },
        template:
            '<BidTransactionTable :auctionTransaction="auctionTransaction" :minimumDepositDai="minimumDepositDAI" />',
    }))
    .add('Decreasing Into Disabled Input', () => ({
        ...common,
        data() {
            return {
                auctionTransaction: {
                    ...fakeAuction,
                    isActive: true,
                    isFinished: false,
                    totalPrice: new BigNumber(faker.finance.amount(50, 55)),
                },
                minimumDepositDAI: new BigNumber(faker.finance.amount(25, 25)),
            };
        },
        created() {
            setInterval(() => {
                this.auctionTransaction.totalPrice = this.auctionTransaction.totalPrice.multipliedBy(0.99);
            }, 5000);
        },
        template:
            '<BidTransactionTable :auctionTransaction="auctionTransaction" :minimumDepositDai="minimumDepositDAI" />',
    }));

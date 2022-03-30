import { storiesOf } from '@storybook/vue';
import faker from 'faker';
import { BigNumber } from 'bignumber.js';
import BidBlock from './BidBlock';
import { generateFakeAuctionTransaction } from '~/helpers/generateFakeAuction';

const fakeAuction = generateFakeAuctionTransaction();

const common = {
    components: { BidBlock },
    data() {
        return {
            auction: fakeAuction,
            transactionBidAmount: new BigNumber(faker.finance.amount()),
        };
    },
};

storiesOf('Transaction/BidBlock', module)
    .add('Default', () => ({
        ...common,
        template: '<BidBlock :auctionTransaction="auction" :transactionBidAmount="transactionBidAmount" />',
    }))
    .add('Disabled', () => ({
        ...common,
        template: '<BidBlock :auctionTransaction="auction" :transactionBidAmount="transactionBidAmount" disabled />',
    }))
    .add('Loading', () => ({
        ...common,
        template: '<BidBlock :auctionTransaction="auction" :transactionBidAmount="transactionBidAmount" is-loading />',
    }))
    .add('Expert Mode', () => ({
        ...common,
        template:
            '<BidBlock :auctionTransaction="auction" :transactionBidAmount="transactionBidAmount" :is-explanations-shown="false" />',
    }))
    .add('Finished', () => ({
        ...common,
        computed: {
            finishedAuction() {
                return {
                    ...fakeAuction,
                    transactionAddress: faker.finance.ethereumAddress(),
                };
            },
        },
        template: '<BidBlock :auctionTransaction="finishedAuction" :transactionBidAmount="transactionBidAmount" />',
    }));

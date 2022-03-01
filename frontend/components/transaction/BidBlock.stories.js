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
            transactionAmountDAI: new BigNumber(faker.finance.amount()),
        };
    },
};

storiesOf('Transaction/BidBlock', module)
    .add('Default', () => ({
        ...common,
        template: '<BidBlock :auctionTransaction="auction" :transactionAmountDAI="transactionAmountDAI" />',
    }))
    .add('Disabled', () => ({
        ...common,
        template: '<BidBlock :auctionTransaction="auction" :transactionAmountDAI="transactionAmountDAI" disabled />',
    }))
    .add('Loading', () => ({
        ...common,
        template: '<BidBlock :auctionTransaction="auction" :transactionAmountDAI="transactionAmountDAI" is-loading />',
    }))
    .add('Expert Mode', () => ({
        ...common,
        template:
            '<BidBlock :auctionTransaction="auction" :transactionAmountDAI="transactionAmountDAI" :is-explanations-shown="false" />',
    }));

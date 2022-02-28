import { storiesOf } from '@storybook/vue';
import BidBlock from './BidBlock';
import { generateFakeAuctionTransaction } from '~/helpers/generateFakeAuction';

const fakeAuction = generateFakeAuctionTransaction();

const common = {
    components: { BidBlock },
    data() {
        return {
            auction: fakeAuction,
        };
    },
};

storiesOf('Transaction/BidBlock', module)
    .add('Default', () => ({
        ...common,
        template: '<BidBlock :auctionTransaction="auction" />',
    }))
    .add('Disabled', () => ({
        ...common,
        template: '<BidBlock :auctionTransaction="auction" disabled />',
    }))
    .add('Loading', () => ({
        ...common,
        template: '<BidBlock :auctionTransaction="auction" is-loading />',
    }))
    .add('Expert Mode', () => ({
        ...common,
        template: '<BidBlock :auctionTransaction="auction" :is-explanations-shown="false" />',
    }));

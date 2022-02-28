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
        template: '<BidBlock :auction="auction" />',
    }))
    .add('Disabled', () => ({
        ...common,
        template: '<BidBlock :auction="auction" disabled />',
    }))
    .add('Loading', () => ({
        ...common,
        template: '<BidBlock :auction="auction" is-loading />',
    }))
    .add('Expert Mode', () => ({
        ...common,
        template: '<BidBlock :auction="auction" :is-explanations-shown="false" />',
    }));

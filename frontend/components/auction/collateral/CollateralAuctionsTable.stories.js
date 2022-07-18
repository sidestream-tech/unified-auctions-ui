import { storiesOf } from '@storybook/vue';
import faker from 'faker';
import AuctionsTable from './AuctionsTable';
import { generateFakeAuctions } from '~/helpers/generateFakeAuction';

const fakeAuctions = generateFakeAuctions();
const randomSelectedAuction = faker.random.arrayElement(fakeAuctions);

const common = {
    components: { AuctionsTable },
    data: () => ({
        auctions: fakeAuctions,
        selectedAuctionId: randomSelectedAuction.id,
        lastUpdated: new Date(faker.date.recent()),
    }),
};

storiesOf('AuctionsTable', module)
    .add('Plain', () => ({
        ...common,
        template:
            '<AuctionsTable :auctions="auctions" :selectedAuctionId="selectedAuctionId" :last-updated="lastUpdated" />',
    }))
    .add('Fetching With Auctions', () => ({
        ...common,
        template: '<AuctionsTable :auctions="auctions" :last-updated="lastUpdated" :is-loading="true" />',
    }))
    .add('Fetching without Auctions', () => ({
        ...common,
        template: '<AuctionsTable :last-updated="lastUpdated" :is-loading="true" />',
    }))
    .add('Empty auctions', () => ({
        ...common,
        template: '<AuctionsTable :last-updated="lastUpdated" />',
    }))
    .add('Error', () => ({
        ...common,
        template: '<AuctionsTable error="There was an error fetching the Auctions." />',
    }))
    .add('Expert Mode', () => ({
        ...common,
        template:
            '<AuctionsTable :auctions="auctions" :selectedAuctionId="selectedAuctionId" show-more-rows :last-updated="lastUpdated" />',
    }));

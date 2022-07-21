import { storiesOf } from '@storybook/vue';
import faker from 'faker';
import SurplusAuctionsTable from './SurplusAuctionsTable';
import { generateFakeSurplusAuctionTransactions } from '~/helpers/generateFakeSurplusAuction';

const fakeAuctions = generateFakeSurplusAuctionTransactions();
const randomSelectedAuction = faker.random.arrayElement(fakeAuctions);

const common = {
    components: { SurplusAuctionsTable },
    data: () => ({
        auctions: fakeAuctions,
        selectedAuctionId: randomSelectedAuction.id,
        lastUpdated: new Date(faker.date.recent()),
    }),
};

storiesOf('Auction/Surplus/SurplusAuctionsTable', module)
    .add('Plain', () => ({
        ...common,
        template:
            '<SurplusAuctionsTable :auctions="auctions" :selectedAuctionId="selectedAuctionId" :last-updated="lastUpdated" />',
    }))
    .add('Fetching With Auctions', () => ({
        ...common,
        template: '<SurplusAuctionsTable :auctions="auctions" :last-updated="lastUpdated" :is-loading="true" />',
    }))
    .add('Fetching without Auctions', () => ({
        ...common,
        template: '<SurplusAuctionsTable :last-updated="lastUpdated" :is-loading="true" />',
    }))
    .add('Empty auctions', () => ({
        ...common,
        template: '<SurplusAuctionsTable :last-updated="lastUpdated" />',
    }))
    .add('Error', () => ({
        ...common,
        template: '<SurplusAuctionsTable error="There was an error fetching the Auctions." />',
    }))
    .add('Expert Mode', () => ({
        ...common,
        template:
            '<SurplusAuctionsTable :auctions="auctions" :selectedAuctionId="selectedAuctionId" show-more-rows :last-updated="lastUpdated" />',
    }));

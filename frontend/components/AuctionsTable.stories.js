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
    }),
};

storiesOf('AuctionsTable', module)
    .add('Plain', () => ({
        ...common,
        template: '<AuctionsTable :auctions="auctions" :selectedAuctionId="selectedAuctionId" />',
    }))
    .add('Empty auctions', () => ({
        ...common,
        template: '<AuctionsTable />',
    }))
    .add('Expert Mode', () => ({
        ...common,
        data: () => ({
            auctions: generateFakeAuctions(100),
            selectedAuctionId: faker.random.arrayElement(fakeAuctions).id,
        }),
        template: '<AuctionsTable :auctions="auctions" :selectedAuctionId="selectedAuctionId" show-more-rows />',
    }));

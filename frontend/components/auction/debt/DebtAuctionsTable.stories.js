import { storiesOf } from '@storybook/vue';
import faker from 'faker';
import DebtAuctionsTable from './DebtAuctionsTable';
import { generateFakeDebtAuctionTransactions } from '~/helpers/generateFakeDebtAuction';

const fakeAuctions = generateFakeDebtAuctionTransactions();
const randomSelectedAuction = faker.random.arrayElement(fakeAuctions);

const common = {
    components: { DebtAuctionsTable },
    data: () => ({
        auctions: fakeAuctions,
        selectedAuctionId: randomSelectedAuction.id,
        lastUpdated: new Date(faker.date.recent()),
    }),
};

storiesOf('Auction/Debt/DebtAuctionsTable', module)
    .add('Plain', () => ({
        ...common,
        template:
            '<DebtAuctionsTable :auctions="auctions" :selectedAuctionId="selectedAuctionId" :last-updated="lastUpdated" />',
    }))
    .add('Fetching With Auctions', () => ({
        ...common,
        template: '<DebtAuctionsTable :auctions="auctions" :last-updated="lastUpdated" :is-loading="true" />',
    }))
    .add('Fetching without Auctions', () => ({
        ...common,
        template: '<DebtAuctionsTable :last-updated="lastUpdated" :is-loading="true" />',
    }))
    .add('Empty auctions', () => ({
        ...common,
        template: '<DebtAuctionsTable :last-updated="lastUpdated" />',
    }))
    .add('Error', () => ({
        ...common,
        template: '<DebtAuctionsTable error="There was an error fetching the Auctions." />',
    }))
    .add('Expert Mode', () => ({
        ...common,
        template:
            '<DebtAuctionsTable :auctions="auctions" :selectedAuctionId="selectedAuctionId" show-more-rows :last-updated="lastUpdated" />',
    }));

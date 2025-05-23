import { storiesOf } from '@storybook/vue';
import faker from 'faker';
import CollateralAuctionsTable from './CollateralAuctionsTable';
import { generateFakeAuctions } from '~/helpers/generateFakeAuction';

const fakeAuctions = generateFakeAuctions();
const randomSelectedAuction = faker.random.arrayElement(fakeAuctions);

const common = {
    components: { CollateralAuctionsTable },
    data: () => ({
        auctions: fakeAuctions,
        selectedAuctionId: randomSelectedAuction.id,
        lastUpdated: new Date(faker.date.recent()),
        isLoading: false,
    }),
};

storiesOf('Auction/Collateral/CollateralAuctionsTable', module)
    .add('Plain', () => ({
        ...common,
        template:
            '<CollateralAuctionsTable :auctions="auctions" :selectedAuctionId="selectedAuctionId" :last-updated="lastUpdated" />',
    }))
    .add('Reset Updated Timer', () => ({
        ...common,
        created() {
            setInterval(() => {
                this.isLoading = true;
                setTimeout(() => {
                    this.isLoading = false;
                }, 1000);
                this.lastUpdated = new Date(faker.date.recent());
            }, 10 * 1000);
        },
        template:
            '<CollateralAuctionsTable :auctions="auctions" :selectedAuctionId="selectedAuctionId" :last-updated="lastUpdated" :is-loading="isLoading" />',
    }))
    .add('Fetching With Auctions', () => ({
        ...common,
        template: '<CollateralAuctionsTable :auctions="auctions" :last-updated="lastUpdated" :is-loading="true" />',
    }))
    .add('Fetching without Auctions', () => ({
        ...common,
        template: '<CollateralAuctionsTable :last-updated="lastUpdated" :is-loading="true" />',
    }))
    .add('Empty auctions', () => ({
        ...common,
        template: '<CollateralAuctionsTable :last-updated="lastUpdated" />',
    }))
    .add('Error', () => ({
        ...common,
        template: '<CollateralAuctionsTable error="There was an error fetching the Auctions." />',
    }))
    .add('Expert Mode', () => ({
        ...common,
        template:
            '<CollateralAuctionsTable :auctions="auctions" :selectedAuctionId="selectedAuctionId" show-more-rows :last-updated="lastUpdated" />',
    }));

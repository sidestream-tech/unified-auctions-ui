import { storiesOf } from '@storybook/vue';
import faker from 'faker';
import CollateralAuctionText from './CollateralAuctionText';
import { generateFakeAuctions } from '~/helpers/generateFakeAuction';

const fakeAuctions = generateFakeAuctions();
const randomSelectedAuction = faker.random.arrayElement(fakeAuctions);

const common = {
    components: { CollateralAuctionText },
    data: () => ({
        auctions: fakeAuctions,
        selectedAuctionId: randomSelectedAuction.id,
    }),
};

storiesOf('Auction/Collateral/CollateralAuctionText', module)
    .add('Plain', () => ({
        ...common,
        template: '<CollateralAuctionText :auctions="auctions" :selectedAuctionId="selectedAuctionId" />',
    }))
    .add('Fetching with Auctions', () => ({
        ...common,
        template:
            '<CollateralAuctionText :auctions="auctions" :selectedAuctionId="selectedAuctionId" :isAuctionsLoading="true" />',
    }))
    .add('Fetching without Auctions', () => ({
        ...common,
        template: '<CollateralAuctionText :isAuctionsLoading="true" />',
    }))
    .add('Error', () => ({
        ...common,
        template: '<CollateralAuctionText auctionsError="There was an error fetching the Auctions." />',
    }))
    .add('Expert Mode', () => ({
        ...common,
        template:
            '<CollateralAuctionText :auctions="auctions" :selectedAuctionId="selectedAuctionId" :isExplanationsShown="false" />',
    }))
    .add('No props', () => ({
        ...common,
        template: '<CollateralAuctionText />',
    }));

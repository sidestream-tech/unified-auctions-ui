import { storiesOf } from '@storybook/vue';
import faker from 'faker';
import MainText from './MainText';
import { generateFakeAuctions } from '~/helpers/generateFakeAuction';

const fakeAuctions = generateFakeAuctions();
const randomSelectedAuction = faker.random.arrayElement(fakeAuctions);

const common = {
    components: { MainText },
    data: () => ({
        auctions: fakeAuctions,
        selectedAuctionId: randomSelectedAuction.id,
    }),
};

storiesOf('MainText', module)
    .add('Plain', () => ({
        ...common,
        template: '<MainText :auctions="auctions" :selectedAuctionId="selectedAuctionId" />',
    }))
    .add('Fetching with Auctions', () => ({
        ...common,
        template: '<MainText :auctions="auctions" :selectedAuctionId="selectedAuctionId" :isAuctionsLoading="true" />',
    }))
    .add('Fetching without Auctions', () => ({
        ...common,
        template: '<MainText :isAuctionsLoading="true" />',
    }))
    .add('Error', () => ({
        ...common,
        template: '<MainText auctionsError="There was an error fetching the Auctions." />',
    }))
    .add('Expert Mode', () => ({
        ...common,
        template:
            '<MainText :auctions="auctions" :selectedAuctionId="selectedAuctionId" :isExplanationsShown="false" />',
    }))
    .add('No props', () => ({
        ...common,
        template: '<MainText />',
    }));

import { storiesOf } from '@storybook/vue';
import faker from 'faker';
import SurplusText from './SurplusText';
import { generateFakeSurplusAuctionTransactions } from '~/helpers/generateFakeSurplusAuction';

const fakeAuctions = generateFakeSurplusAuctionTransactions();
const randomSelectedAuction = faker.random.arrayElement(fakeAuctions);

const common = {
    components: { SurplusText },
    data: () => ({
        auctions: fakeAuctions,
        selectedAuctionId: randomSelectedAuction.id,
    }),
};

storiesOf('Auction/Surplus/SurplusText', module)
    .add('Default', () => ({
        ...common,
        template: '<SurplusText :auctions="auctions" />',
    }))
    .add('Fetching with auction', () => ({
        ...common,
        template: '<SurplusText :auctions="auctions" :areAuctionsFetching="true" />',
    }))
    .add('Fetching without auction', () => ({
        ...common,
        template: '<SurplusText :areAuctionsFetching="true" />',
    }))
    .add('Error', () => ({
        ...common,
        template: '<SurplusText auctionsError="There was an error fetching the Auctions." />',
    }))
    .add('Expert', () => ({
        ...common,
        template: '<SurplusText :auctions="auctions" :isExplanationsShown="false" />',
    }));

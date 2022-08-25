import { storiesOf } from '@storybook/vue';
import faker from 'faker';
import DebtText from './DebtText';
import { generateFakeDebtAuctionTransactions } from '~/helpers/generateFakeDebtAuction';

const fakeAuctions = generateFakeDebtAuctionTransactions();
const randomSelectedAuction = faker.random.arrayElement(fakeAuctions);

const common = {
    components: { DebtText },
    data: () => ({
        auctions: fakeAuctions,
        selectedAuctionId: randomSelectedAuction.id,
    }),
};

storiesOf('Auction/Debt/DebtText', module)
    .add('Default', () => ({
        ...common,
        template: '<DebtText :auctions="auctions" />',
    }))
    .add('Fetching with auction', () => ({
        ...common,
        template: '<DebtText :auctions="auctions" :areAuctionsFetching="true" />',
    }))
    .add('Fetching without auction', () => ({
        ...common,
        template: '<DebtText :areAuctionsFetching="true" />',
    }))
    .add('Error', () => ({
        ...common,
        template: '<DebtText auctionsError="There was an error fetching the Auctions." />',
    }))
    .add('Expert', () => ({
        ...common,
        template: '<DebtText :auctions="auctions" :isExplanationsShown="false" />',
    }));

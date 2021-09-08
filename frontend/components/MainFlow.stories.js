import { storiesOf } from '@storybook/vue';
import faker from 'faker';
import MainFlow from './MainFlow.vue';
import { generateFakeAuctionTransactions } from '~/helpers/generateFakeAuction';

const fakeAuctions = generateFakeAuctionTransactions();
const randomSelectedAuctionId = faker.random.arrayElement(fakeAuctions).id;

storiesOf('Main Flow', module)
    .add('Default', () => ({
        components: {
            MainFlow,
        },
        data: () => ({ fakeAuctions, randomSelectedAuctionId }),
        template: `<MainFlow :auctions="fakeAuctions" />`,
    }))
    .add('Selected Auction', () => ({
        components: {
            MainFlow,
        },
        data: () => ({ fakeAuctions, randomSelectedAuctionId }),
        template: `<MainFlow :auctions="fakeAuctions" :selectedAuctionId.sync="randomSelectedAuctionId" />`,
    }))
    .add('AuctionId Not Found', () => ({
        components: {
            MainFlow,
        },
        data: () => ({ fakeAuctions, randomSelectedAuctionId: 'none' }),
        template: `<MainFlow :auctions="fakeAuctions" :selectedAuctionId.sync="randomSelectedAuctionId" />`,
    }))
    .add('Empty Auctions', () => ({
        components: {
            MainFlow,
        },
        data: () => ({ fakeAuctions: [], randomSelectedAuctionId }),
        template: `<MainFlow />`,
    }));

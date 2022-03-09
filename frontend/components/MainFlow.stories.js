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
        template: `<MainFlow :auctions="fakeAuctions" :is-fetching="{auctions: false, takeEvents: false}" />`,
    }))
    .add('Default Expert', () => ({
        components: {
            MainFlow,
        },
        data: () => ({ fakeAuctions, randomSelectedAuctionId }),
        template: `<MainFlow :isExplanationsShown="false" :is-fetching="{auctions: false, takeEvents: false}" :auctions="fakeAuctions" />`,
    }))
    .add('Selected Auction', () => ({
        components: {
            MainFlow,
        },
        data: () => ({ fakeAuctions, randomSelectedAuctionId }),
        template: `<MainFlow :auctions="fakeAuctions" :is-fetching="{auctions: false, takeEvents: false}" :selectedAuctionId.sync="randomSelectedAuctionId" />`,
    }))
    .add('Selected Auction Loading', () => ({
        components: {
            MainFlow,
        },
        data: () => ({ fakeAuctions, randomSelectedAuctionId }),
        template: `<MainFlow :auctions="[]" :is-fetching="{auctions: true, takeEvents: false}" :selectedAuctionId.sync="randomSelectedAuctionId" />`,
    }))
    .add('Selected Auction Expert', () => ({
        components: {
            MainFlow,
        },
        data: () => ({ fakeAuctions, randomSelectedAuctionId }),
        template: `<MainFlow :isExplanationsShown="false" :auctions="fakeAuctions" :is-fetching="{auctions: false, takeEvents: false}" :selectedAuctionId.sync="randomSelectedAuctionId" />`,
    }))
    .add('AuctionId Not Found', () => ({
        components: {
            MainFlow,
        },
        data: () => ({ fakeAuctions, randomSelectedAuctionId: 'none' }),
        template: `<MainFlow :auctions="fakeAuctions" :is-fetching="{auctions: false, takeEvents: false}" :selectedAuctionId.sync="randomSelectedAuctionId" />`,
    }))
    .add('AuctionId Not Found Expert', () => ({
        components: {
            MainFlow,
        },
        data: () => ({ fakeAuctions, randomSelectedAuctionId: 'none' }),
        template: `<MainFlow :isExplanationsShown="false" :is-fetching="{auctions: false, takeEvents: false}" :auctions="fakeAuctions" :selectedAuctionId.sync="randomSelectedAuctionId" />`,
    }))
    .add('Empty Auctions', () => ({
        components: {
            MainFlow,
        },
        data: () => ({ fakeAuctions: [], randomSelectedAuctionId }),
        template: `<MainFlow :is-fetching="{auctions: false, takeEvents: false}" />`,
    }))
    .add('Empty Auctions Expert', () => ({
        components: {
            MainFlow,
        },
        data: () => ({ fakeAuctions: [], randomSelectedAuctionId }),
        template: `<MainFlow :isExplanationsShown="false" :is-fetching="{auctions: false, takeEvents: false}" />`,
    }));

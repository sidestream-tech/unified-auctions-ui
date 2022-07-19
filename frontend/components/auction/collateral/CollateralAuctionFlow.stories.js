import { storiesOf } from '@storybook/vue';
import faker from 'faker';
import CollateralAuctionFlow from './CollateralAuctionFlow';
import { generateFakeAuctionTransactions } from '~/helpers/generateFakeAuction';

const fakeAuctions = generateFakeAuctionTransactions();
const randomSelectedAuctionId = faker.random.arrayElement(fakeAuctions).id;

storiesOf('Auction/Collateral/CollateralAuctionFlow', module)
    .add('Default', () => ({
        components: {
            CollateralAuctionFlow,
        },
        data: () => ({ fakeAuctions, randomSelectedAuctionId }),
        template: `<CollateralAuctionFlow :auctions="fakeAuctions" />`,
    }))
    .add('Default Expert', () => ({
        components: {
            CollateralAuctionFlow,
        },
        data: () => ({ fakeAuctions, randomSelectedAuctionId }),
        template: `<CollateralAuctionFlow :isExplanationsShown="false" :auctions="fakeAuctions" />`,
    }))
    .add('Selected Auction', () => ({
        components: {
            CollateralAuctionFlow,
        },
        data: () => ({ fakeAuctions, randomSelectedAuctionId }),
        template: `<CollateralAuctionFlow :auctions="fakeAuctions" :selectedAuctionId.sync="randomSelectedAuctionId" />`,
    }))
    .add('Selected Auction Loading', () => ({
        components: {
            CollateralAuctionFlow,
        },
        data: () => ({ fakeAuctions, randomSelectedAuctionId }),
        template: `<CollateralAuctionFlow :auctions="[]" :are-auctions-fetching="true" :selectedAuctionId.sync="randomSelectedAuctionId" />`,
    }))
    .add('Selected Auction Expert', () => ({
        components: {
            CollateralAuctionFlow,
        },
        data: () => ({ fakeAuctions, randomSelectedAuctionId }),
        template: `<CollateralAuctionFlow :isExplanationsShown="false" :auctions="fakeAuctions" :selectedAuctionId.sync="randomSelectedAuctionId" />`,
    }))
    .add('AuctionId Not Found', () => ({
        components: {
            CollateralAuctionFlow,
        },
        data: () => ({ fakeAuctions, randomSelectedAuctionId: 'none' }),
        template: `<CollateralAuctionFlow :auctions="fakeAuctions" :selectedAuctionId.sync="randomSelectedAuctionId" />`,
    }))
    .add('AuctionId Not Found Expert', () => ({
        components: {
            CollateralAuctionFlow,
        },
        data: () => ({ fakeAuctions, randomSelectedAuctionId: 'none' }),
        template: `<CollateralAuctionFlow :isExplanationsShown="false" :auctions="fakeAuctions" :selectedAuctionId.sync="randomSelectedAuctionId" />`,
    }))
    .add('Empty Auctions', () => ({
        components: {
            CollateralAuctionFlow,
        },
        data: () => ({ fakeAuctions: [], randomSelectedAuctionId }),
        template: `<CollateralAuctionFlow />`,
    }))
    .add('Empty Auctions Expert', () => ({
        components: {
            CollateralAuctionFlow,
        },
        data: () => ({ fakeAuctions: [], randomSelectedAuctionId }),
        template: `<CollateralAuctionFlow :isExplanationsShown="false"  />`,
    }));

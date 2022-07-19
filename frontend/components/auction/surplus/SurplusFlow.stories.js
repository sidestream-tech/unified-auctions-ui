import { storiesOf } from '@storybook/vue';
import faker from 'faker';
import BigNumber from 'bignumber.js';
import SurplusFlow from './SurplusFlow';
import { generateFakeSurplusAuctionTransactions } from '~/helpers/generateFakeSurplusAuction';

const fakeAuctions = generateFakeSurplusAuctionTransactions();
const randomSelectedAuctionId = faker.random.arrayElement(fakeAuctions).id;

const common = {
    components: { SurplusFlow },
    data: () => ({
        auctions: fakeAuctions,
        lastUpdated: new Date(),
        network: 'mainnet',
        tokenAddress: faker.finance.ethereumAddress(),
        walletAddress: faker.finance.ethereumAddress(),
        walletMKR: new BigNumber(faker.finance.amount(1001, 1200)),
        allowanceMKR: new BigNumber(faker.finance.amount(1001, 1200)),
    }),
    template: `
        <SurplusFlow 
          v-bind="$data"
        />`,
};

storiesOf('Auction/Surplus/SurplusFlow', module)
    .add('Default', () => ({
        ...common,
    }))
    .add('Expert Mode', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            isExplanationsShown: false,
        }),
    }))
    .add('Selected Auction', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            selectedAuctionId: randomSelectedAuctionId.toString(),
        }),
        template: `
        <SurplusFlow
          :selectedAuctionId.sync="selectedAuctionId"
          v-bind="$data"
        />`,
    }))
    .add('Selected Auction Loading', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            selectedAuctionId: randomSelectedAuctionId.toString(),
        }),
        template: `
        <SurplusFlow
          :auctions="[]"
          :areAuctionsFetching="true"
          :selectedAuctionId.sync="selectedAuctionId"
        />`,
    }))
    .add('Selected Auction Expert', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            selectedAuctionId: randomSelectedAuctionId.toString(),
            isExplanationsShown: false,
        }),
        template: `
          <SurplusFlow
            :selectedAuctionId.sync="selectedAuctionId"
            v-bind="$data"
          />`,
    }))
    .add('Selected Auction Not found', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            selectedAuctionId: '-1',
        }),
        template: `
        <SurplusFlow
          selectedAuctionId.sync="selectedAuctionId"
          v-bind="$data"
        />`,
    }))
    .add('Selected Auction Not found Expert', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            selectedAuctionId: '-1',
            isExplanationsShown: false,
        }),
        template: `
          <SurplusFlow
            selectedAuctionId.sync="selectedAuctionId"
            v-bind="$data"
          />`,
    }))
    .add('No Auctions', () => ({
        ...common,
        template: `
          <SurplusFlow />`,
    }))
    .add('No Auctions Expert', () => ({
        ...common,
        template: `
          <SurplusFlow :isExplanationsShown="false" />`,
    }));

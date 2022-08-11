import { storiesOf } from '@storybook/vue';
import faker from 'faker';
import BigNumber from 'bignumber.js';
import DebtFlow from './DebtFlow';
import { generateFakeDebtAuctionTransactions } from '~/helpers/generateFakeDebtAuction';

const fakeAuctions = generateFakeDebtAuctionTransactions();
const randomSelectedAuctionId = faker.random.arrayElement(fakeAuctions).id;

const common = {
    components: { DebtFlow },
    data: () => ({
        auctions: fakeAuctions,
        lastUpdated: new Date(),
        network: 'mainnet',
        tokenAddress: faker.finance.ethereumAddress(),
        walletAddress: faker.finance.ethereumAddress(),
        walletDai: new BigNumber(faker.finance.amount(1001, 1200)),
        allowanceDai: new BigNumber(faker.finance.amount(1001, 1200)),
    }),
    template: `
        <DebtFlow 
          v-bind="$data"
        />`,
};

storiesOf('Auction/Debt/DebtFlow', module)
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
        <DebtFlow
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
        <DebtFlow
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
          <DebtFlow
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
        <DebtFlow
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
          <DebtFlow
            selectedAuctionId.sync="selectedAuctionId"
            v-bind="$data"
          />`,
    }))
    .add('No Auctions', () => ({
        ...common,
        template: `
          <DebtFlow />`,
    }))
    .add('No Auctions Expert', () => ({
        ...common,
        template: `
          <DebtFlow :isExplanationsShown="false" />`,
    }));

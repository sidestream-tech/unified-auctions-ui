import { storiesOf } from '@storybook/vue';
import { action } from '@storybook/addon-actions';
import BigNumber from 'bignumber.js';
import faker from 'faker';
import HighestDebtBidCheckPanel from './HighestDebtBidCheckPanel';
import { generateFakeDebtAuction } from '~/helpers/generateFakeDebtAuction';

const fakeDebtAuction = generateFakeDebtAuction('have-bids');

const common = {
    components: { HighestDebtBidCheckPanel },
    data: () => ({
        isExplanationsShown: true,
        auction: fakeDebtAuction,
        bidAmount: new BigNumber(fakeDebtAuction.bidAmountDai).times(1.1),
        walletAddress: faker.finance.ethereumAddress(),
    }),
    methods: {
        bid: action('bid'),
    },
};

storiesOf('Panels/HighestDebtBidCheckPanel', module)
    .add('No bids', () => ({
        ...common,
        data: () => ({
            auction: generateFakeDebtAuction('just-started'),
            bidAmount: new BigNumber(56).times(1.1),
            walletAddress: faker.finance.ethereumAddress(),
        }),
        template: `<HighestDebtBidCheckPanel :auction="auction" :walletAddress="walletAddress" :bidAmount="bidAmount" />`,
    }))
    .add('No Bids, No Wallet', () => ({
        ...common,
        data: () => ({
            auction: generateFakeDebtAuction('just-started'),
            bidAmount: new BigNumber(56).times(1.1),
        }),
        template: `<HighestDebtBidCheckPanel :auction="auction" :bidAmount="bidAmount" @bid="bid" />`,
    }))
    .add('With Bids', () => ({
        ...common,
        template: `<HighestDebtBidCheckPanel :auction="auction" :bidAmount="bidAmount" :walletAddress="walletAddress" @bid="bid" />`,
    }))
    .add('With Bids, No Wallet', () => ({
        ...common,
        template: `<HighestDebtBidCheckPanel :auction="auction" :bidAmount="bidAmount" @bid="bid" />`,
    }))
    .add('With Bids, disabled', () => ({
        ...common,
        template: `<HighestDebtBidCheckPanel :auction="auction" :bidAmount="bidAmount" :walletAddress="walletAddress" :disabled="true" @bid="bid" />`,
    }))
    .add('With Bids, Highest Bidder', () => ({
        ...common,
        data: () => ({
            auction: fakeDebtAuction,
            bidAmount: new BigNumber(fakeDebtAuction.bidAmountDai).times(1.1),
            walletAddress: fakeDebtAuction.receiverAddress,
        }),
        template: `<HighestDebtBidCheckPanel :auction="auction" :walletAddress="walletAddress" :bidAmount="bidAmount" />`,
    }))
    .add('Bidding', () => ({
        ...common,
        template: `<HighestDebtBidCheckPanel :auction="auction" :bidAmount="bidAmount" :walletAddress="walletAddress" :disabled="true" :isBidding="true" @bid="bid" />`,
    }))
    .add('No wallet, is Loading', () => ({
        ...common,
        template: `<HighestDebtBidCheckPanel :auction="auction" :bidAmount="bidAmount" :isLoading="true" @bid="bid" />`,
    }))
    .add('With Wallet, is Loading', () => ({
        ...common,
        template: `<HighestDebtBidCheckPanel :auction="auction" :bidAmount="bidAmount" :isLoading="true" :walletAddress="walletAddress" @bid="bid" />`,
    }));

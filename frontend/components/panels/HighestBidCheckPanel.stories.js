import { storiesOf } from '@storybook/vue';
import { action } from '@storybook/addon-actions';
import BigNumber from 'bignumber.js';
import faker from 'faker';
import HighestBidCheckPanel from '~/components/panels/HighestBidCheckPanel';
import { generateFakeSurplusAuction } from '~/helpers/generateFakeSurplusAuction';

const fakeSurplusAuction = generateFakeSurplusAuction('have-bids');

const common = {
    components: { HighestBidCheckPanel },
    data: () => ({
        isExplanationsShown: true,
        auction: fakeSurplusAuction,
        bidAmount: new BigNumber(fakeSurplusAuction.bidAmountMKR).times(1.1),
        userWalletAddress: faker.finance.ethereumAddress(),
    }),
    methods: {
        bid: action('bid'),
    },
};

storiesOf('Panels/HighestBidCheckPanel', module)
    .add('No bids', () => ({
        ...common,
        data: () => ({
            auction: generateFakeSurplusAuction('just-started'),
            bidAmount: new BigNumber(56).times(1.1),
            userWalletAddress: faker.finance.ethereumAddress(),
        }),
        template: `<HighestBidCheckPanel :auction="auction" :userWalletAddress="userWalletAddress" :bidAmount="bidAmount" />`,
    }))
    .add('No Bids, No Wallet', () => ({
        ...common,
        data: () => ({
            auction: generateFakeSurplusAuction('just-started'),
            bidAmount: new BigNumber(56).times(1.1),
        }),
        template: `<HighestBidCheckPanel :auction="auction" :bidAmount="bidAmount" />`,
    }))
    .add('With Bids', () => ({
        ...common,
        template: `<HighestBidCheckPanel :auction="auction" :bidAmount="bidAmount" :userWalletAddress="userWalletAddress" />`,
    }))
    .add('With Bids, No Wallet', () => ({
        ...common,
        template: `<HighestBidCheckPanel :auction="auction" :bidAmount="bidAmount" />`,
    }))
    .add('With Bids, disabled', () => ({
        ...common,
        template: `<HighestBidCheckPanel :auction="auction" :bidAmount="bidAmount" :userWalletAddress="userWalletAddress" :disabled="true" />`,
    }))
    .add('With Bids, Highest Bidder', () => ({
        ...common,
        data: () => ({
            auction: fakeSurplusAuction,
            bidAmount: new BigNumber(fakeSurplusAuction.bidAmountMKR).times(1.1),
            userWalletAddress: fakeSurplusAuction.receiverAddress,
        }),
        template: `<HighestBidCheckPanel :auction="auction" :userWalletAddress="userWalletAddress" :bidAmount="bidAmount" />`,
    }))
    .add('Bidding', () => ({
        ...common,
        template: `<HighestBidCheckPanel :auction="auction" :bidAmount="bidAmount" :userWalletAddress="userWalletAddress" :disabled="true" :isBidding="true" />`,
    }))
    .add('No wallet, is Loading', () => ({
        ...common,
        template: `<HighestBidCheckPanel :auction="auction" :bidAmount="bidAmount" :isLoading="true" />`,
    }))
    .add('With Wallet, is Loading', () => ({
        ...common,
        template: `<HighestBidCheckPanel :auction="auction" :bidAmount="bidAmount" :isLoading="true" :userWalletAddress="userWalletAddress" />`,
    }));

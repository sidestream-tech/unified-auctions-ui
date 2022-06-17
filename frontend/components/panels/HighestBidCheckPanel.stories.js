import { storiesOf } from '@storybook/vue';
import { action } from '@storybook/addon-actions';
import BigNumber from 'bignumber.js';
import faker from 'faker';
import HighestBidCheckPanel from '~/components/panels/HighestBidCheckPanel';
import { generateFakeSurplusAuction } from '~/helpers/generateFakeSurplusAuction';

const fakeSurplusAuction = generateFakeSurplusAuction();
const fakeSurplusAuctionNoBids = generateFakeSurplusAuction(true);
const fakeSurplusAuctionBidEvents = fakeSurplusAuction.events.filter(event => {
    return event.type === 'bid';
});

const common = {
    components: { HighestBidCheckPanel },
    data: () => ({
        isExplanationsShown: true,
        auction: fakeSurplusAuction,
        bidAmount: new BigNumber(fakeSurplusAuction.events[fakeSurplusAuction.events.length - 1].bidAmountMKR).times(
            1.1
        ),
        userWalletAddress: fakeSurplusAuctionBidEvents[0].address,
    }),
    methods: {
        bid: action('bid'),
    },
};

storiesOf('Surplus/HighestBidCheckPanel', module)
    .add('No Wallet, No Bids', () => ({
        ...common,
        data: () => ({
            auction: fakeSurplusAuctionNoBids,
            bidAmount: new BigNumber(56).times(1.1),
        }),
        template: `<HighestBidCheckPanel :auction="auction" :bidAmount="bidAmount" />`,
    }))
    .add('No Wallet, With Bids', () => ({
        ...common,
        template: `<HighestBidCheckPanel :auction="auction" :bidAmount="bidAmount" />`,
    }))
    .add('No bids yet', () => ({
        ...common,
        data: () => ({
            auction: fakeSurplusAuctionNoBids,
            bidAmount: new BigNumber(56).times(1.1),
            userWalletAddress: faker.finance.ethereumAddress(),
        }),
        template: `<HighestBidCheckPanel :auction="auction" :userWalletAddress="userWalletAddress" :bidAmount="bidAmount" />`,
    }))
    .add('With Bids', () => ({
        ...common,
        template: `<HighestBidCheckPanel :auction="auction" :bidAmount="bidAmount" :userWalletAddress="userWalletAddress" />`,
    }))
    .add('With Bids, disabled', () => ({
        ...common,
        template: `<HighestBidCheckPanel :auction="auction" :bidAmount="bidAmount" :userWalletAddress="userWalletAddress" :isDisabled="true" />`,
    }))
    .add('With Bids, Highest Bidder', () => ({
        ...common,
        data: () => ({
            auction: fakeSurplusAuction,
            bidAmount: new BigNumber(
                fakeSurplusAuction.events[fakeSurplusAuction.events.length - 1].bidAmountMKR
            ).times(1.1),
            userWalletAddress: fakeSurplusAuctionBidEvents[fakeSurplusAuctionBidEvents.length - 1].address,
        }),
        template: `<HighestBidCheckPanel :auction="auction" :userWalletAddress="userWalletAddress" :bidAmount="bidAmount" />`,
    }))
    .add('Bidding', () => ({
        ...common,
        template: `<HighestBidCheckPanel :auction="auction" :bidAmount="bidAmount" :userWalletAddress="userWalletAddress" :isDisabled="true" :isBidding="true" />`,
    }))
    .add('No wallet, is Loading', () => ({
        ...common,
        template: `<HighestBidCheckPanel :bidAmount="bidAmount" :isLoading="true" />`,
    }))
    .add('With Wallet, is Loading', () => ({
        ...common,
        template: `<HighestBidCheckPanel :bidAmount="bidAmount" :isLoading="true" :userWalletAddress="userWalletAddress" />`,
    }))
    .add('With Wallet, Error', () => ({
        ...common,
        template: `<HighestBidCheckPanel :bidAmount="bidAmount" error="An Error occurred. Oops" :userWalletAddress="userWalletAddress" />`,
    }));

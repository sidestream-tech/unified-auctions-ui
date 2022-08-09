import { storiesOf } from '@storybook/vue';
import { action } from '@storybook/addon-actions';
import DebtAuction from './DebtAuction';
import { generateFakeDebtAuctionTransaction } from '~/helpers/generateFakeDebtAuction';

const fakeAuctionWithBids = generateFakeDebtAuctionTransaction('have-bids');
const common = {
    components: {
        DebtAuction,
    },
    data() {
        return {
            auction: fakeAuctionWithBids,
        };
    },
    methods: {
        bid: action('bid'),
    },
};

storiesOf('Auction/Debt/DebtAuction', module)
    .add('Just Started', () => ({
        ...common,
        data() {
            return {
                auction: generateFakeDebtAuctionTransaction('just-started'),
            };
        },
        template: `<DebtAuction :auction="auction" :auctionId="1" @bid="bid" />`,
    }))
    .add('Has Bids', () => ({
        ...common,
        template: `<DebtAuction :auction="auction" :auctionId="1" @bid="bid" />`,
    }))
    .add('Requires Restart', () => ({
        ...common,
        data() {
            return {
                auction: generateFakeDebtAuctionTransaction('requires-restart'),
            };
        },
        template: `<DebtAuction :auction="auction" :auctionId="1" @bid="bid" />`,
    }))
    .add('Ready for collection', () => ({
        ...common,
        data() {
            return {
                auction: generateFakeDebtAuctionTransaction('ready-for-collection'),
            };
        },
        template: `<DebtAuction :auction="auction" :auctionId="1" @bid="bid" />`,
    }))
    .add('Collected', () => ({
        ...common,
        data() {
            return {
                auction: generateFakeDebtAuctionTransaction('collected'),
            };
        },
        template: `<DebtAuction :auction="auction" :auctionId="1" error="This auction is finished" />`,
    }))
    .add('Max Width', () => ({
        ...common,
        template: `
        <div class="flex items-center w-3/5">
            <DebtAuction :auction="auction" :auctionId="1" @bid="bid" />
        </div>`,
    }))
    .add('Not Found', () => ({
        ...common,
        data() {
            return {
                auction: null,
            };
        },
        template: `<DebtAuction :auction="auction" :auctionId="1" />`,
    }))
    .add('Auction Updating', () => ({
        ...common,
        template: `<DebtAuction :auction="auction" :areAuctionsFetching="true" :auctionId="1" @bid="bid" />`,
    }));

import { storiesOf } from '@storybook/vue';
import { action } from '@storybook/addon-actions';
import SurplusAuction from './SurplusAuction';
import { generateFakeSurplusAuctionTransaction } from '~/helpers/generateFakeSurplusAuction';

const fakeSurplusAuctionWithBids = generateFakeSurplusAuctionTransaction('have-bids');
const common = {
    components: {
        SurplusAuction,
    },
    data() {
        return {
            auction: fakeSurplusAuctionWithBids,
        };
    },
    methods: {
        bid: action('bid'),
    },
};

storiesOf('Auction/Surplus/SurplusAuction', module)
    .add('Just Started', () => ({
        ...common,
        data() {
            return {
                auction: generateFakeSurplusAuctionTransaction('just-started'),
            };
        },
        template: `<SurplusAuction :auction="auction" :auctionId="1" @bid="bid" />`,
    }))
    .add('Has Bids', () => ({
        ...common,
        template: `<SurplusAuction :auction="auction" :auctionId="1" @bid="bid" />`,
    }))
    .add('Requires Restart', () => ({
        ...common,
        data() {
            return {
                auction: generateFakeSurplusAuctionTransaction('requires-restart'),
            };
        },
        template: `<SurplusAuction :auction="auction" :auctionId="1" @bid="bid" />`,
    }))
    .add('Ready for collection', () => ({
        ...common,
        data() {
            return {
                auction: generateFakeSurplusAuctionTransaction('ready-for-collection'),
            };
        },
        template: `<SurplusAuction :auction="auction" :auctionId="1" @bid="bid" />`,
    }))
    .add('Collected', () => ({
        ...common,
        data() {
            return {
                auction: generateFakeSurplusAuctionTransaction('collected'),
            };
        },
        template: `<SurplusAuction :auction="auction" :auctionId="1" error="This auction is finished" />`,
    }))
    .add('Max Width', () => ({
        ...common,
        template: `
        <div class="flex items-center w-3/5">
            <SurplusAuction :auction="auction" :auctionId="1" @bid="bid" />
        </div>`,
    }))
    .add('Not Found', () => ({
        ...common,
        data() {
            return {
                auction: null,
            };
        },
        template: `<SurplusAuction :auction="auction" :auctionId="1" />`,
    }))
    .add('Auction Updating', () => ({
        ...common,
        template: `<SurplusAuction :auction="auction" :areAuctionsFetching="true" :auctionId="1" @bid="bid" />`,
    }));

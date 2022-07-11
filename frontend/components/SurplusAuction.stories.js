import { storiesOf } from '@storybook/vue';
import SurplusAuction from './SurplusAuction.vue';
import { generateFakeSurplusAuction } from '~/helpers/generateFakeSurplusAuction';

const fakeSurplusAuctionWithBids = generateFakeSurplusAuction('have-bids');
const common = {
    components: {
        SurplusAuction,
    },
    data() {
        return {
            auction: fakeSurplusAuctionWithBids,
        };
    },
};

storiesOf('SurplusAuction', module)
    .add('Default', () => ({
        ...common,
        template: `<SurplusAuction :auction="auction" auctionId="test" />`,
    }))
    .add('Max Width', () => ({
        ...common,
        template: `
        <div class="flex items-center w-3/5">
            <SurplusAuction :auction="auction" auctionId="test" />
        </div>`,
    }))
    .add('Not Found', () => ({
        ...common,
        data() {
            return {
                auction: null,
            };
        },
        template: `<SurplusAuction :auction="auction" auctionId="test" />`,
    }))
    .add('Auction Updating', () => ({
        ...common,
        template: `<SurplusAuction :auction="auction" :areAuctionsFetching="true" auctionId="test" />`,
    }))
    .add('Requires Restart', () => ({
        ...common,
        data() {
            return {
                auction: generateFakeSurplusAuction('requires-restart'),
            };
        },
        template: `<SurplusAuction :auction="auction" auctionId="test" />`,
    }))
    .add('Finished', () => ({
        ...common,
        data() {
            return {
                auction: generateFakeSurplusAuction('collected'),
            };
        },
        template: `<SurplusAuction :auction="auction" auctionId="test" error="This auction is finished" />`,
    }));

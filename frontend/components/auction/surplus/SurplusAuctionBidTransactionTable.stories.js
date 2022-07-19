import { storiesOf } from '@storybook/vue';
import { action } from '@storybook/addon-actions';
import SurplusAuctionBidTransactionTable from './SurplusAuctionBidTransactionTable';
import { generateFakeSurplusAuctionTransaction } from '~/helpers/generateFakeSurplusAuction';

const common = {
    components: { SurplusAuctionBidTransactionTable },
    data: () => ({
        auction: generateFakeSurplusAuctionTransaction('have-bids'),
    }),
    methods: {
        inputBidAmount: action('inputBidAmount'),
    },
    template: `<SurplusAuctionBidTransactionTable :auction="auction" @inputBidAmount="inputBidAmount" />`,
};

storiesOf('Auction/Surplus/SurplusAuctionBidTransactionTable', module).add('Default', () => ({
    ...common,
}));

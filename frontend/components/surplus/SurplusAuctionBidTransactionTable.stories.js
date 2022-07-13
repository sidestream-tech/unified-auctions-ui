import { storiesOf } from '@storybook/vue';
import { action } from '@storybook/addon-actions';
import BigNumber from 'bignumber.js';
import SurplusAuctionBidTransactionTable from './SurplusAuctionBidTransactionTable';
import { generateFakeSurplusAuctionTransaction } from '~/helpers/generateFakeSurplusAuction';

const common = {
    components: { SurplusAuctionBidTransactionTable },
    data: () => ({
        auction: generateFakeSurplusAuctionTransaction('have-bids'),
        lowestNextBid: new BigNumber(2),
    }),
    methods: {
        inputBidAmount: action('inputBidAmount'),
    },
    template: `<SurplusAuctionBidTransactionTable :lowest-next-bid="lowestNextBid" :auction="auction" @inputBidAmount="inputBidAmount" />`,
};

storiesOf('Surplus/SurplusAuctionBidTransactionTable', module).add('Default', () => ({
    ...common,
}));

import { storiesOf } from '@storybook/vue';
import { action } from '@storybook/addon-actions';
import SurplusAuctionBidTransactionTable from './SurplusAuctionBidTransactionTable';
import { generateFakeSurplusAuctionTransaction } from '~/helpers/generateFakeSurplusAuction';

const fakeSurplusAuction = generateFakeSurplusAuctionTransaction('have-bids');

const common = {
    template: `<SurplusAuctionBidTransactionTable
        :auction="auction"
        @inputBidAmount="inputBidAmount"
    />`,
    components: { SurplusAuctionBidTransactionTable },
    data() {
        return {
            auction: {
                ...fakeSurplusAuction,
            },
        };
    },
    methods: {
        inputBidAmount: action('inputBidAmount'),
    },
};

storiesOf('Surplus/SurplusAuctionBidTransactionTable', module).add('Default', () => ({
    ...common,
}));

import { storiesOf } from '@storybook/vue';
import { action } from '@storybook/addon-actions';
import SurplusAuctionBidTransactionTable from './SurplusAuctionBidTransactionTable';
import { generateFakeSurplusAuction } from '~/helpers/generateFakeSurplusAuction';

const fakeSurplusAuction = generateFakeSurplusAuction();

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

storiesOf('Transaction/SurplusAuctionBidTransactionTable', module).add('Default', () => ({
    ...common,
}));

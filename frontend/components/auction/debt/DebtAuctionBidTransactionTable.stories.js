import { storiesOf } from '@storybook/vue';
import { action } from '@storybook/addon-actions';
import DebtAuctionBidTransactionTable from './DebtAuctionBidTransactionTable';
import { generateFakeDebtAuctionTransaction } from '~/helpers/generateFakeDebtAuction';

const common = {
    components: { DebtAuctionBidTransactionTable },
    data: () => ({
        auction: generateFakeDebtAuctionTransaction('have-bids'),
    }),
    methods: {
        inputBidAmount: action('inputBidAmount'),
    },
    template: `<DebtAuctionBidTransactionTable :auction="auction" @inputBidAmount="inputBidAmount" />`,
};

storiesOf('Auction/Debt/DebtAuctionBidTransactionTable', module).add('Default', () => ({
    ...common,
}));

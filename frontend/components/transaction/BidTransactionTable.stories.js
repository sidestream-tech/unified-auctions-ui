import { storiesOf } from '@storybook/vue';
import BidTransactionTable from './BidTransactionTable';
import { generateFakeAuctionTransaction } from '~/helpers/generateFakeAuction';

const fakeAuction = generateFakeAuctionTransaction();

const common = {
    components: { BidTransactionTable },
    data() {
        return {
            auctionTransaction: fakeAuction,
        };
    },
};

storiesOf('Transaction/BidTransactionTable', module).add('Default', () => ({
    ...common,
    template: '<BidTransactionTable :auctionTransaction="auctionTransaction" />',
}));

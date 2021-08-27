import { storiesOf } from '@storybook/vue';
import { generateFakeAuctionTransaction } from '~/helpers/generateFakeAuction.js';
import SwapTransactionTable from '~/components/SwapTransactionTable.vue';

const fakeAuctionTransaction = generateFakeAuctionTransaction();

storiesOf('SwapTransaction Table', module).add('Default', () => ({
    components: {
        SwapTransactionTable,
    },
    data: () => ({
        auctionTransaction: fakeAuctionTransaction,
    }),
    template: '<SwapTransactionTable :auctionTransaction="auctionTransaction"/>',
}));

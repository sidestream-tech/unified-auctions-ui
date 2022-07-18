import { storiesOf } from '@storybook/vue';
import { generateFakeAuctionTransaction } from '~/helpers/generateFakeAuction.ts';
import SwapTransactionTable from '~/components/transaction/SwapTransactionTable.vue';

const fakeAuctionTransaction = generateFakeAuctionTransaction();

storiesOf('Transaction/SwapTransaction Table', module).add('Default', () => ({
    components: {
        SwapTransactionTable,
    },
    data: () => ({
        auctionTransaction: fakeAuctionTransaction,
    }),
    template: '<SwapTransactionTable :auctionTransaction="auctionTransaction"/>',
}));

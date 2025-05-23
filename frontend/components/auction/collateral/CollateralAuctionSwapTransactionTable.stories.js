import { storiesOf } from '@storybook/vue';
import CollateralAuctionSwapTransactionTable from './CollateralAuctionSwapTransactionTable';
import { generateFakeAuctionTransaction } from '~/helpers/generateFakeAuction.ts';

const fakeAuctionTransaction = generateFakeAuctionTransaction();

storiesOf('Auction/Collateral/CollateralAuctionSwapTransactionTable', module).add('Default', () => ({
    components: {
        CollateralAuctionSwapTransactionTable,
    },
    data: () => ({
        auctionTransaction: fakeAuctionTransaction,
    }),
    template: '<CollateralAuctionSwapTransactionTable :auctionTransaction="auctionTransaction"/>',
}));

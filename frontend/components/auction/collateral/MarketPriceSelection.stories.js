import { storiesOf } from '@storybook/vue';
import MarketPriceSelection from './MarketPriceSelection';
import { generateFakeAuctionTransaction } from '~/helpers/generateFakeAuction.ts';

const fakeAuctionTransaction = generateFakeAuctionTransaction();

storiesOf('Auction/Collateral/MarketPriceSelection', module).add('Default', () => ({
    components: {
        MarketPriceSelection,
    },
    data: () => ({
        auctionTransaction: fakeAuctionTransaction,
    }),
    template: '<MarketPriceSelection :auction-transaction="auctionTransaction"/>',
}));

import { storiesOf } from '@storybook/vue';
import MarketPriceSelection from './MarketPriceSelection';
import { generateFakeAuctionTransaction } from '~/helpers/generateFakeAuction.ts';

const fakeAuctionTransaction = generateFakeAuctionTransaction();

const common = {
    components: {
        MarketPriceSelection,
    },
    data: () => ({
        auctionTransaction: fakeAuctionTransaction,
        marketId: '',
    }),
    template: `<MarketPriceSelection :auction-transaction="auctionTransaction" :market-id.sync="marketId" profit-token="DAI" />`,
};

storiesOf('Auction/Collateral/MarketPriceSelection', module).add('Default', () => ({ ...common }));

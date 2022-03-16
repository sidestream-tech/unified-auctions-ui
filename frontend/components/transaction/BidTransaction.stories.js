import { storiesOf } from '@storybook/vue';
import BidTransaction from './BidTransaction';
import { generateFakeAuctionTransaction } from '~/helpers/generateFakeAuction';

const fakeAuctionTransaction = generateFakeAuctionTransaction();

const common = {
    components: { BidTransaction },
    data() {
        return {
            auctionTransaction: { ...fakeAuctionTransaction, isActive: true, isFinished: false },
        };
    },
};

storiesOf('Transaction/BidTransaction', module).add('Default', () => ({
    ...common,
    template: '<BidTransaction :auctionTransaction="auctionTransaction" />',
}));

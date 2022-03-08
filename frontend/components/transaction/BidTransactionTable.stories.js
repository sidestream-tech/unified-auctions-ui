import { storiesOf } from '@storybook/vue';
import faker from 'faker';
import BigNumber from 'bignumber.js';
import BidTransactionTable from './BidTransactionTable';
import { generateFakeAuctionTransaction } from '~/helpers/generateFakeAuction';

const fakeAuction = generateFakeAuctionTransaction();

const common = {
    components: { BidTransactionTable },
    data() {
        return {
            auctionTransaction: fakeAuction,
            minimumDepositDAI: new BigNumber(faker.finance.amount(0, 50)),
        };
    },
};

storiesOf('Transaction/BidTransactionTable', module).add('Default', () => ({
    ...common,
    template:
        '<BidTransactionTable :auctionTransaction="auctionTransaction" :minimumDepositDAI="minimumDepositDAI" />',
}));

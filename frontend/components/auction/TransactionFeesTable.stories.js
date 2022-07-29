import { storiesOf } from '@storybook/vue';
import TransactionFeesTable from './TransactionFeesTable.vue';
import { generateFakeAuctionTransaction } from '~/helpers/generateFakeAuction.ts';

const fakeAuctionTransaction = generateFakeAuctionTransaction();

const common = {
    components: {
        TransactionFeesTable,
    },
    data() {
        return {
            fees: {
                'Swap Transaction Fee': fakeAuctionTransaction.swapTransactionFeeETH,
                'Wallet Authorization Fee': fakeAuctionTransaction.authTransactionFeeETH,
                'Collateral Authorization Fee': fakeAuctionTransaction.authTransactionFeeETH,
            },
        };
    },
    computed: {
        combinedFeesETH() {
            const reducer = (accumulator, curr) => accumulator.plus(curr);
            return Object.values(this.fees).reduce(reducer);
        },
    },
};

storiesOf('Auction/TransactionFeesTable', module).add('Default', () => ({
    ...common,
    template: '<TransactionFeesTable :fees="fees" :combined-fees-eth="combinedFeesETH" />',
}));

import { storiesOf } from '@storybook/vue';
import { generateFakeAuctionTransaction } from '~/helpers/generateFakeAuction.ts';
import TransactionFeesTable from '~/components/transaction/TransactionFeesTable.vue';

const fakeAuctionTransaction = generateFakeAuctionTransaction();

const common = {
    components: {
        TransactionFeesTable,
    },
    data() {
        return {
            fees: {
                type: 'swap',
                transETH: fakeAuctionTransaction.swapTransactionFeeETH,
                authETH: fakeAuctionTransaction.authTransactionFeeETH,
                totalETH: fakeAuctionTransaction.combinedSwapFeesETH,
            },
        };
    },
};

storiesOf('Transaction/TransactionFeesTable', module)
    .add('Default Swap Transaction', () => ({
        ...common,
        template: '<TransactionFeesTable :is-wallet-connected="true" :fees="fees" />',
    }))
    .add('Default Bid Transaction', () => ({
        ...common,
        data() {
            return {
                fees: {
                    type: 'bid',
                    transETH: fakeAuctionTransaction.bidTransactionFeeETH,
                    authETH: fakeAuctionTransaction.authTransactionFeeETH,
                    totalETH: fakeAuctionTransaction.combinedBidFeesETH,
                },
            };
        },
        template: '<TransactionFeesTable :is-wallet-connected="true" :fees="fees" />',
    }))
    .add('Wallet Not Connected', () => ({
        ...common,
        template: '<TransactionFeesTable :is-wallet-connected="false" :fees="fees"/>',
    }))
    .add('Wallet Authorized', () => ({
        ...common,
        template: '<TransactionFeesTable :is-wallet-connected="true" :is-wallet-authed="true" :fees="fees"/>',
    }))
    .add('Wallet And Collateral Authorized', () => ({
        ...common,
        template: `
        <TransactionFeesTable
            :is-wallet-connected="true"
            :is-wallet-authed="true"
            :is-collateral-authed="true"
            :fees="fees"
        />`,
    }));

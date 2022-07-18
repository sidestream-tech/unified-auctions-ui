import { storiesOf } from '@storybook/vue';
import { generateFakeAuctionTransaction } from '~/helpers/generateFakeAuction.ts';
import TransactionFeesTable from '~/components/transaction/TransactionFeesTable.vue';

const fakeAuctionTransaction = generateFakeAuctionTransaction();
const fakeAuctionTransactionWalletAuthed = generateFakeAuctionTransaction('wallet');
const fakeAuctionTransactionWalletAndCollateralAuthed = generateFakeAuctionTransaction('wallet-and-collateral');

const common = {
    components: {
        TransactionFeesTable,
    },
    data: () => ({
        swapTransactionFeeETH: fakeAuctionTransaction.swapTransactionFeeETH,
        bidTransactionFeeETH: fakeAuctionTransaction.bidTransactionFeeETH,
        authTransactionFeeETH: fakeAuctionTransaction.authTransactionFeeETH,
        combinedSwapFeesETH: fakeAuctionTransaction.combinedSwapFeesETH,
        combinedBidFeesETH: fakeAuctionTransaction.combinedBidFeesETH,
    }),
};

storiesOf('Transaction/TransactionFeesTable', module)
    .add('Default Swap Transaction', () => ({
        ...common,
        template: `
        <TransactionFeesTable
            :is-wallet-connected="true"
            :swap-transaction-fee-e-t-h="swapTransactionFeeETH"
            :auth-transaction-fee-e-t-h="authTransactionFeeETH"
            :combined-swap-fees-e-t-h="combinedSwapFeesETH"
        />`,
    }))
    .add('Default Bid Transaction', () => ({
        ...common,
        template: `
        <TransactionFeesTable
            :is-wallet-connected="true"
            :bid-transaction-fee-e-t-h="bidTransactionFeeETH"
            :auth-transaction-fee-e-t-h="authTransactionFeeETH"
            :combined-bid-fees-e-t-h="combinedBidFeesETH"
        />`,
    }))
    .add('Wallet Not Connected', () => ({
        ...common,
        template: `<TransactionFeesTable :is-wallet-connected="false"/>`,
    }))
    .add('Wallet Authorized', () => ({
        ...common,
        data() {
            return {
                swapTransactionFeeETH: fakeAuctionTransactionWalletAuthed.swapTransactionFeeETH,
                authTransactionFeeETH: fakeAuctionTransactionWalletAuthed.authTransactionFeeETH,
                combinedSwapFeesETH: fakeAuctionTransactionWalletAuthed.combinedSwapFeesETH,
            };
        },
        template: `
        <TransactionFeesTable
            :is-wallet-connected="true"
            :is-wallet-authed="true"
            :swap-transaction-fee-e-t-h="swapTransactionFeeETH"
            :auth-transaction-fee-e-t-h="authTransactionFeeETH"
            :combined-swap-fees-e-t-h="combinedSwapFeesETH"
        />`,
    }))
    .add('Wallet And Collateral Authorized', () => ({
        ...common,
        data() {
            return {
                swapTransactionFeeETH: fakeAuctionTransactionWalletAndCollateralAuthed.swapTransactionFeeETH,
                authTransactionFeeETH: fakeAuctionTransactionWalletAndCollateralAuthed.authTransactionFeeETH,
                combinedSwapFeesETH: fakeAuctionTransactionWalletAndCollateralAuthed.combinedSwapFeesETH,
            };
        },
        template: `
        <TransactionFeesTable
            :is-wallet-connected="true"
            :is-wallet-authed="true"
            :is-collateral-authed="true"
            :swap-transaction-fee-e-t-h="swapTransactionFeeETH"
            :auth-transaction-fee-e-t-h="authTransactionFeeETH"
            :combined-swap-fees-e-t-h="combinedSwapFeesETH"
        />`,
    }));

import { storiesOf } from '@storybook/vue';
import faker from 'faker';
import TransactionMessage from './TransactionMessage';
import { generateFakeAuctionTransaction } from '~/helpers/generateFakeAuction.ts';

const fakeAuctionTransaction = generateFakeAuctionTransaction();
const fakeAuctionTransactionWalletAuthed = generateFakeAuctionTransaction('wallet');
const fakeAuctionTransactionCollateralAuthed = generateFakeAuctionTransaction('collateral');
const fakeAuctionTransactionWalletAndCollateralAuthed = generateFakeAuctionTransaction('wallet-and-collateral');

const common = {
    components: { TransactionMessage },
    data() {
        return {
            swapTransactionFeeETH: fakeAuctionTransaction.swapTransactionFeeETH,
            bidTransactionFeeETH: fakeAuctionTransaction.bidTransactionFeeETH,
            authTransactionFeeETH: fakeAuctionTransaction.authTransactionFeeETH,
            combinedSwapFeesETH: fakeAuctionTransaction.combinedSwapFeesETH,
            combinedBidFeesETH: fakeAuctionTransaction.combinedBidFeesETH,
        };
    },
};

storiesOf('Transaction/TransactionMessage', module)
    .add('Default', () => ({
        ...common,
        template: `
            <TransactionMessage 
                :is-wallet-connected="true"
                :swap-transaction-fee-e-t-h="swapTransactionFeeETH"
                :bid-transaction-fee-e-t-h="bidTransactionFeeETH"
                :auth-transaction-fee-e-t-h="authTransactionFeeETH"
                :combined-swap-fees-e-t-h="combinedSwapFeesETH"
                :combined-bid-fees-e-t-h="combinedBidFeesETH"
            />`,
    }))
    .add('Wallet Authorized', () => ({
        ...common,
        data() {
            return {
                swapTransactionFeeETH: fakeAuctionTransactionWalletAuthed.swapTransactionFeeETH,
                bidTransactionFeeETH: fakeAuctionTransactionWalletAuthed.bidTransactionFeeETH,
                authTransactionFeeETH: fakeAuctionTransactionWalletAuthed.authTransactionFeeETH,
                combinedSwapFeesETH: fakeAuctionTransactionWalletAuthed.combinedSwapFeesETH,
                combinedBidFeesETH: fakeAuctionTransactionWalletAuthed.combinedBidFeesETH,
            };
        },
        template: `
            <TransactionMessage
                :is-wallet-connected="true"
                :is-wallet-authed="true"
                :swap-transaction-fee-e-t-h="swapTransactionFeeETH"
                :bid-transaction-fee-e-t-h="bidTransactionFeeETH"
                :auth-transaction-fee-e-t-h="authTransactionFeeETH"
                :combined-swap-fees-e-t-h="combinedSwapFeesETH"
                :combined-bid-fees-e-t-h="combinedBidFeesETH"
            />`,
    }))
    .add('Collateral Authorized', () => ({
        ...common,
        data() {
            return {
                swapTransactionFeeETH: fakeAuctionTransactionCollateralAuthed.swapTransactionFeeETH,
                bidTransactionFeeETH: fakeAuctionTransactionCollateralAuthed.bidTransactionFeeETH,
                authTransactionFeeETH: fakeAuctionTransactionCollateralAuthed.authTransactionFeeETH,
                combinedSwapFeesETH: fakeAuctionTransactionCollateralAuthed.combinedSwapFeesETH,
                combinedBidFeesETH: fakeAuctionTransactionCollateralAuthed.combinedBidFeesETH,
            };
        },
        template: `
            <TransactionMessage
                :is-wallet-connected="true"
                :is-collateral-authed="true"
                :swap-transaction-fee-e-t-h="swapTransactionFeeETH"
                :bid-transaction-fee-e-t-h="bidTransactionFeeETH"
                :auth-transaction-fee-e-t-h="authTransactionFeeETH"
                :combined-swap-fees-e-t-h="combinedSwapFeesETH"
                :combined-bid-fees-e-t-h="combinedBidFeesETH"
            />`,
    }))
    .add('Wallet and Collateral Authorized', () => ({
        ...common,
        data() {
            return {
                swapTransactionFeeETH: fakeAuctionTransactionWalletAndCollateralAuthed.swapTransactionFeeETH,
                bidTransactionFeeETH: fakeAuctionTransactionWalletAndCollateralAuthed.bidTransactionFeeETH,
                authTransactionFeeETH: fakeAuctionTransactionWalletAndCollateralAuthed.authTransactionFeeETH,
                combinedSwapFeesETH: fakeAuctionTransactionWalletAndCollateralAuthed.combinedSwapFeesETH,
                combinedBidFeesETH: fakeAuctionTransactionWalletAndCollateralAuthed.combinedBidFeesETH,
            };
        },
        template: `
            <TransactionMessage
                :is-wallet-connected="true"
                :is-wallet-authed="true"
                :is-collateral-authed="true"
                :swap-transaction-fee-e-t-h="swapTransactionFeeETH"
                :bid-transaction-fee-e-t-h="bidTransactionFeeETH"
                :auth-transaction-fee-e-t-h="authTransactionFeeETH"
                :combined-swap-fees-e-t-h="combinedSwapFeesETH"
                :combined-bid-fees-e-t-h="combinedBidFeesETH"
            />`,
    }))
    .add('Show "Different Wallet" Info Message', () => ({
        ...common,
        template: '<TransactionMessage show-different-wallet-info />',
    }))
    .add('Finished', () => ({
        ...common,
        data() {
            return {
                transactionAddress: faker.finance.ethereumAddress(),
            };
        },
        template: '<TransactionMessage :transaction-address="transactionAddress" />',
    }));

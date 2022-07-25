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
};

storiesOf('Auction/TransactionFeesTable', module)
    .add('Default Swap Transaction', () => ({
        ...common,
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

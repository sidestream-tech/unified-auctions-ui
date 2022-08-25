import { storiesOf } from '@storybook/vue';
import faker from 'faker';
import TransactionMessage from './TransactionMessage';
import { generateFakeAuctionTransaction } from '~/helpers/generateFakeAuction.ts';

const fakeAuctionTransaction = generateFakeAuctionTransaction();

const common = {
    components: { TransactionMessage },
    data() {
        return {
            fees: {
                'Swap Transaction Fee': fakeAuctionTransaction.swapTransactionFeeETH,
                'Wallet Authorization Fee': fakeAuctionTransaction.authTransactionFeeETH,
                'Collateral Authorization Fee': fakeAuctionTransaction.authTransactionFeeETH,
            },
            transactionAddress: faker.finance.ethereumAddress(),
        };
    },
};

storiesOf('Auction/TransactionMessage', module)
    .add('Default', () => ({
        ...common,
        template: '<TransactionMessage :fees="fees" />',
    }))
    .add('Show "Different Wallet" Info Message', () => ({
        ...common,
        template: '<TransactionMessage :fees="fees"  show-different-wallet-info />',
    }))
    .add('Unknown Fees', () => ({
        ...common,
        template: '<TransactionMessage />',
    }))
    .add('Finished', () => ({
        ...common,
        template: '<TransactionMessage :transaction-address="transactionAddress" />',
    }));

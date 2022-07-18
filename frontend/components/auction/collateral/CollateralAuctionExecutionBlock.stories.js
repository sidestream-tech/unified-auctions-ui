import { storiesOf } from '@storybook/vue';
import faker from 'faker';
import ExecutionBlock from '~/components/transaction/ExecutionBlock';
import { generateFakeAuctionTransaction } from '~/helpers/generateFakeAuction';

const fakeAuctionTransaction = generateFakeAuctionTransaction();

const common = {
    components: { ExecutionBlock },
    data() {
        return {
            auctionTransaction: fakeAuctionTransaction,
            isLoading: false,
            transactionAddress: null,
            demoTransactionAddress: faker.finance.ethereumAddress(),
        };
    },
    methods: {
        execute() {
            this.isLoading = true;
            setTimeout(() => {
                this.transactionAddress = this.demoTransactionAddress;
                this.isLoading = false;
            }, 1000);
        },
    },
};

storiesOf('Transaction/ExecutionBlock', module)
    .add('Default', () => ({
        ...common,
        template: `<ExecutionBlock :isLoading="isLoading" 
                                   @execute="execute" 
                                   :transactionAddress="transactionAddress" 
                                   :transaction-fee="auctionTransaction.transactionFeeETH"
                                   :collateral-type="auctionTransaction.collateralType" />`,
    }))
    .add('Disabled', () => ({
        ...common,
        template: `<ExecutionBlock :disabled="true"
                                   :transaction-fee="auctionTransaction.transactionFeeETH"
                                   :collateral-type="auctionTransaction.collateralType" />`,
    }))
    .add('Not Executed', () => ({
        ...common,
        template: `<ExecutionBlock :transaction-fee="auctionTransaction.transactionFeeETH"
                                   :collateral-type="auctionTransaction.collateralType" />`,
    }))
    .add('Executing', () => ({
        ...common,
        template: `<ExecutionBlock :isLoading="true"
                                   :transaction-fee="auctionTransaction.transactionFeeETH"
                                   :collateral-type="auctionTransaction.collateralType" />`,
    }))
    .add('Executed', () => ({
        ...common,
        template: `<ExecutionBlock :transactionAddress="demoTransactionAddress"
                                   :transaction-fee="auctionTransaction.transactionFeeETH"
                                   :collateral-type="auctionTransaction.collateralType" />`,
    }));

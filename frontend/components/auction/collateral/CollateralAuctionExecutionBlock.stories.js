import { storiesOf } from '@storybook/vue';
import faker from 'faker';
import CollateralAuctionExecutionBlock from './CollateralAuctionExecutionBlock';
import { generateFakeAuctionTransaction } from '~/helpers/generateFakeAuction';

const fakeAuctionTransaction = generateFakeAuctionTransaction();

const common = {
    components: { CollateralAuctionExecutionBlock },
    data() {
        return {
            auctionTransaction: fakeAuctionTransaction,
            isLoading: false,
            transactionAddress: null,
            demoTransactionAddress: faker.finance.ethereumAddress(),
            fees: {
                type: 'swap',
                transETH: fakeAuctionTransaction.swapTransactionFeeETH,
                authETH: fakeAuctionTransaction.authTransactionFeeETH,
                totalETH: fakeAuctionTransaction.combinedSwapFeesETH,
            },
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

storiesOf('Auction/Collateral/CollateralAuctionExecutionBlock', module)
    .add('Default', () => ({
        ...common,
        template: `<CollateralAuctionExecutionBlock :isLoading="isLoading" 
                                   @execute="execute" 
                                   :transactionAddress="transactionAddress" 
                                   :fees="fees"
                                   :collateral-type="auctionTransaction.collateralType" />`,
    }))
    .add('Disabled', () => ({
        ...common,
        template: `<CollateralAuctionExecutionBlock :disabled="true"
                                   :fees="fees"
                                   :collateral-type="auctionTransaction.collateralType" />`,
    }))
    .add('Not Executed', () => ({
        ...common,
        template: `<CollateralAuctionExecutionBlock :fees="fees"
                                   :collateral-type="auctionTransaction.collateralType" />`,
    }))
    .add('Executing', () => ({
        ...common,
        template: `<CollateralAuctionExecutionBlock :isLoading="true"
                                   :fees="fees"
                                   :collateral-type="auctionTransaction.collateralType" />`,
    }))
    .add('Executed', () => ({
        ...common,
        template: `<CollateralAuctionExecutionBlock :transactionAddress="demoTransactionAddress"
                                   :fees="fees"
                                   :collateral-type="auctionTransaction.collateralType" />`,
    }));

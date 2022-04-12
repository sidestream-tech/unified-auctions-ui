import { storiesOf } from '@storybook/vue';
import faker from 'faker';
import BigNumber from 'bignumber.js';
import WithdrawCollateralPanel from './WithdrawCollateralPanel';
import { generateFakeAuctionTransaction } from '~/helpers/generateFakeAuction';

const fakeAuctionTransaction = generateFakeAuctionTransaction();

const common = {
    components: { WithdrawCollateralPanel },
    data: () => ({
        collateralType: fakeAuctionTransaction.collateralType,
        collateralVatBalance: new BigNumber(faker.finance.amount()),
        isWithdrawing: false,
        isFetching: false,
        disabled: false,
        isExplanationsShown: true,
    }),
    methods: {
        withdraw() {
            this.isWithdrawing = true;
            setTimeout(() => {
                this.collateralVatBalance = new BigNumber(0);
                this.isWithdrawing = false;
            }, 1000);
        },
        refresh() {
            this.isFetching = true;
            setTimeout(() => {
                this.collateralVatBalance = new BigNumber(faker.finance.amount());
                this.isFetching = false;
            }, 1000);
        },
    },
    template: `
    <WithdrawCollateralPanel 
        v-bind="$data" 
        @withdrawAllCollateralFromVat="withdraw" 
        @fetchCollateralVatBalance="refresh" 
    />`,
};

storiesOf('Panels/WithdrawCollateralPanel', module)
    .add('Nothing to withdraw', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            collateralVatBalance: new BigNumber(0),
        }),
    }))
    .add('Withdraw', () => ({
        ...common,
    }))
    .add('Refreshing', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            isFetching: true,
        }),
    }))
    .add('Withdrawing', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            isWithdrawing: true,
        }),
    }))
    .add('Disabled', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            disabled: true,
        }),
    }))
    .add('Expert Mode', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            isExplanationsShown: false,
        }),
    }));

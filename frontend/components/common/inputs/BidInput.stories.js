import { storiesOf } from '@storybook/vue';
import BigNumber from 'bignumber.js';
import faker from 'faker';
import BidInput from './BidInput';

const common = {
    components: { BidInput },
    data() {
        return {
            totalPrice: new BigNumber(faker.finance.amount()),
            minimumBidDai: new BigNumber(faker.finance.amount(0, 20)),
            transactionBidAmount: undefined,
        };
    },
};

storiesOf('Common/Inputs/BidInput', module)
    .add('Default', () => ({
        ...common,
        template: `
    <div class="w-80">
        <BidInput :transactionBidAmount.sync="transactionBidAmount" :totalPrice="totalPrice" :minimumBidDai="minimumBidDai" />
    </div>`,
    }))
    .add('Surplus Transaction', () => ({
        ...common,
        template: `
    <div class="w-80">
        <BidInput :transactionBidAmount.sync="transactionBidAmount" auction-type="surplus" :totalPrice="totalPrice" :minimumBidDai="minimumBidDai" />
    </div>`,
    }))
    .add('Disabled', () => ({
        ...common,
        template: `
    <div class="w-80">
        <BidInput :transactionBidAmount.sync="transactionBidAmount" :totalPrice="totalPrice" :minimumBidDai="minimumBidDai" disabled />
    </div>`,
    }));

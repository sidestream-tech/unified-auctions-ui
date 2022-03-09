import { storiesOf } from '@storybook/vue';
import BigNumber from 'bignumber.js';
import faker from 'faker';
import BidInput from './BidInput';

const common = {
    components: { BidInput },
    data() {
        return {
            totalPrice: new BigNumber(faker.finance.amount()),
            minimumDepositDAI: new BigNumber(faker.finance.amount(0, 20)),
            value: undefined,
        };
    },
};

storiesOf('Utils/BidInput', module)
    .add('Default', () => ({
        ...common,
        template: `
    <div class="w-80">
        <BidInput v-model="value" :totalPrice="totalPrice" :minimumDepositDai="minimumDepositDAI" />
    </div>`,
    }))
    .add('Disabled', () => ({
        ...common,
        template: `
    <div class="w-80">
        <BidInput v-model="value" :totalPrice="totalPrice" :minimumDepositDai="minimumDepositDAI" disabled />
    </div>`,
    }));

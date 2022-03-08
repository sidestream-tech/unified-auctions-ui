import { storiesOf } from '@storybook/vue';
import BigNumber from 'bignumber.js';
import faker from 'faker';
import BidInput from './BidInput';

const common = {
    components: { BidInput },
    data() {
        return {
            totalPrice: new BigNumber(faker.finance.amount()),
            minimumAmountDAI: new BigNumber(faker.finance.amount(0, 20)),
            value: undefined,
        };
    },
};

storiesOf('Utils/BidInput', module)
    .add('Default', () => ({
        ...common,
        template: `
    <div class="w-80">
        <BidInput class="ml-24" v-model="value" :totalPrice="totalPrice" :minimumAmountDAI="minimumAmountDAI" />
    </div>`,
    }))
    .add('Disabled', () => ({
        ...common,
        template: `
    <div class="w-80">
        <BidInput class="ml-24" v-model="value" :totalPrice="totalPrice" :minimumAmountDAI="minimumAmountDAI" disabled />
    </div>`,
    }));

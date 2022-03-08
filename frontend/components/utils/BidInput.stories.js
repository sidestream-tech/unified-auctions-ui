import { storiesOf } from '@storybook/vue';
import BigNumber from 'bignumber.js';
import faker from 'faker';
import BidInput from './BidInput';

const common = {
    components: { BidInput },
    data() {
        return {
            totalPrice: new BigNumber(faker.finance.amount()),
        };
    },
};

storiesOf('Utils/BidInput', module).add('Default', () => ({
    ...common,
    template: '<div class="w-80"><BidInput :totalPrice="totalPrice" /></div>',
}));

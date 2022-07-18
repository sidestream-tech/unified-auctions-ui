import { storiesOf } from '@storybook/vue';
import BigNumber from 'bignumber.js';
import faker from 'faker';
import FormatPercentage from '~/components/common/formatters/FormatPercentage';

const common = {
    components: { FormatPercentage },
};

storiesOf('Common/Formatters/FormatPercentage', module).add('Default', () => ({
    ...common,
    data() {
        return {
            amount: new BigNumber(faker.datatype.number(1)),
        };
    },
    template: '<format-market-value :value="amount"/>',
}));

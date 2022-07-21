import { storiesOf } from '@storybook/vue';
import faker from 'faker';
import FormatPercentage from './FormatPercentage';

const common = {
    components: { FormatPercentage },
};

storiesOf('Common/Formatters/FormatPercentage', module).add('Default', () => ({
    ...common,
    data() {
        return {
            amount: faker.datatype.number(1),
        };
    },
    template: '<FormatPercentage :value="amount"/>',
}));

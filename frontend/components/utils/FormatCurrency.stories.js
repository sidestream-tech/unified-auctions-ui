import { storiesOf } from '@storybook/vue';
import FormatCurrency from '~/components/utils/FormatCurrency';

const common = {
    components: { FormatCurrency },
};

storiesOf('Utils/FormatCurrency', module)
    .add('Default', () => ({
        ...common,
        template: '<FormatCurrency :value="654.6546" currency="dai" />',
    }))
    .add('No value', () => ({
        ...common,
        template: '<FormatCurrency currency="dai" />',
    }));

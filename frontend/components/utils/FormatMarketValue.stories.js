import { storiesOf } from '@storybook/vue';
import FormatMarketValue from '~/components/utils/FormatMarketValue';

const common = {
    components: { FormatMarketValue },
};

storiesOf('Utils/FormatMarketValue', module)
    .add('Above Zero', () => ({
        ...common,
        template: '<format-market-value :value="0.34"/>',
    }))
    .add('Below Zero', () => ({
        ...common,
        template: '<format-market-value :value="-0.24"/>',
    }));

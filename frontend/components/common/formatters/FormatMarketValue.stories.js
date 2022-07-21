import { storiesOf } from '@storybook/vue';
import BigNumber from 'bignumber.js';
import FormatMarketValue from './FormatMarketValue';

const common = {
    components: { FormatMarketValue },
};

storiesOf('Common/Formatters/FormatMarketValue', module)
    .add('Above Zero', () => ({
        ...common,
        template: '<format-market-value :value="0.3476"/>',
    }))
    .add('Below Zero', () => ({
        ...common,
        template: '<format-market-value :value="-0.24"/>',
    }))
    .add('Zero', () => ({
        ...common,
        template: '<format-market-value :value="0"/>',
    }))
    .add('No number', () => ({
        ...common,
        template: '<format-market-value />',
    }))
    .add('With Bignumber', () => ({
        ...common,
        data() {
            return {
                amount: BigNumber(0.547),
            };
        },
        template: '<format-market-value :value="amount"/>',
    }));

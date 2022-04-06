import { storiesOf } from '@storybook/vue';
import { action } from '@storybook/addon-actions';
import faker from 'faker';
import BigNumber from 'bignumber.js';
import GrossProfitCheckPanel from '~/components/panels/GrossProfitCheckPanel';

const common = {
    components: { GrossProfitCheckPanel },
    data: () => ({
        grossProfit: new BigNumber(faker.finance.amount(100, 200)),
    }),
    methods: {
        isCorrect: action('isCorrect'),
    },
    template: `
    <GrossProfitCheckPanel 
        v-bind="$data"
        @update:isCorrect="isCorrect"
    />
    `,
};

storiesOf('Panels/GrossProfitCheckPanel', module)
    .add('Negative Gross Profit', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            grossProfit: new BigNumber(-10),
        }),
    }))
    .add('Positive Gross Profit', () => ({
        ...common,
    }))
    .add('Unknown Gross Profit', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            grossProfit: undefined,
        }),
    }))
    .add('Expert Mode', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            isExplanationsShown: false,
            grossProfit: new BigNumber(-10),
        }),
    }));

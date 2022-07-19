import { storiesOf } from '@storybook/vue';
import { action } from '@storybook/addon-actions';
import faker from 'faker';
import BigNumber from 'bignumber.js';
import ProfitCheckPanel from './ProfitCheckPanel';

const common = {
    components: { ProfitCheckPanel },
    data: () => ({
        netProfit: new BigNumber(faker.finance.amount(100, 200)),
        grossProfit: new BigNumber(faker.finance.amount(100, 200)),
    }),
    methods: {
        isCorrect: action('isCorrect'),
    },
    template: `
    <ProfitCheckPanel 
        v-bind="$data"
        @update:isCorrect="isCorrect"
    />
    `,
};

storiesOf('Panels/ProfitCheckPanel', module)
    .add('Negative Profit', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            grossProfit: new BigNumber(-10),
            netProfit: new BigNumber(-10),
        }),
    }))
    .add('Negative Gross Profit, Positive Net Profit', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            grossProfit: new BigNumber(-10),
            netProfit: new BigNumber(10),
        }),
    }))
    .add('Positive Profit', () => ({
        ...common,
    }))
    .add('Positive Gross Profit, Negative Net Profit', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            netProfit: new BigNumber(-10),
        }),
    }))
    .add('Unknown Profit', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            netProfit: undefined,
            grossProfit: undefined,
        }),
    }))
    .add('NaN Big Numbers', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            netProfit: new BigNumber('NaN'),
            grossProfit: new BigNumber('NaN'),
        }),
    }))
    .add('Unknown Net Profit', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            netProfit: undefined,
        }),
    }));

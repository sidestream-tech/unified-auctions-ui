import { storiesOf } from '@storybook/vue';
import { action } from '@storybook/addon-actions';
import faker from 'faker';
import BigNumber from 'bignumber.js';
import NetProfitCheckPanel from '~/components/panels/NetProfitCheckPanel';

const common = {
    components: { NetProfitCheckPanel },
    data: () => ({
        netProfit: new BigNumber(faker.finance.amount(100, 200)),
    }),
    methods: {
        isCorrect: action('isCorrect'),
    },
    template: `
    <NetProfitCheckPanel 
        v-bind="$data"
        @update:isCorrect="isCorrect"
    />
    `,
};

storiesOf('Panels/NetProfitCheckPanel', module)
    .add('Negative Net Profit', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            netProfit: new BigNumber(-10),
        }),
    }))
    .add('Positive Net Profit', () => ({
        ...common,
    }))
    .add('Unknown Net Profit', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            netProfit: undefined,
        }),
    }))
    .add('Expert Mode', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            isExplanationsShown: false,
            netProfit: new BigNumber(-10),
        }),
    }));

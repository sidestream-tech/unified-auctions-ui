import { storiesOf } from '@storybook/vue';
import { action } from '@storybook/addon-actions';
import faker from 'faker';
import BigNumber from 'bignumber.js';
import AllowanceAmountCheckPanel from './AllowanceAmountCheckPanel';

const common = {
    components: { AllowanceAmountCheckPanel },
    data() {
        return {
            allowanceAmount: new BigNumber(faker.finance.amount(0, 100)),
            desiredAmount: new BigNumber(faker.finance.amount(101, 200)),
            isLoading: false,
            disabled: false,
            isExplanationsShown: true,
        };
    },
    methods: {
        setAllowanceAmount(amount) {
            this.isLoading = true;
            setTimeout(() => {
                this.allowanceAmount = amount || new BigNumber(Number.MAX_VALUE);
                this.isLoading = false;
            }, 1000);
        },
        isCorrect: action('isCorrect'),
    },
    template: `
        <AllowanceAmountCheckPanel
            v-bind="$data"
            @setAllowanceAmount="setAllowanceAmount"
            @update:isCorrect="isCorrect"
        />`,
};

storiesOf('Panels/AllowanceAmountCheckPanel', module)
    .add('Within Allowance', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            allowanceAmount: new BigNumber(faker.finance.amount(101, 200)),
            desiredAmount: new BigNumber(faker.finance.amount(0, 100)),
        }),
    }))
    .add('Exceeds Allowance', () => ({
        ...common,
    }))
    .add('Unlimited Allowance', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            allowanceAmount: new BigNumber(Number.MAX_VALUE),
        }),
    }))
    .add('Missing Allowance Amount', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            allowanceAmount: undefined,
        }),
    }))
    .add('Missing Desired Amount', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            desiredAmount: undefined,
        }),
    }))
    .add('Desired Amount is NaN', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            desiredAmount: new BigNumber(NaN),
        }),
    }))
    .add('Loading', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            isLoading: true,
        }),
    }))
    .add('Disabled', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            disabled: true,
        }),
    }))
    .add('With MKR', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            currency: 'MKR',
        }),
    }))
    .add('Expert Mode', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            isExplanationsShown: false,
        }),
    }));

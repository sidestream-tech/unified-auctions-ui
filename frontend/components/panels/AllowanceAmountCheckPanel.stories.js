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
            desiredAmount: new BigNumber(faker.finance.amount(100, 200)),
            isLoading: false,
            disabled: false,
            isCorrect: false,
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
    },
    watch: {
        isCorrect: {
            immediate: true,
            handler(isCorrect) {
                action('isCorrect')(isCorrect);
            },
        },
    },
    template: `
        <AllowanceAmountCheckPanel 
            :allowance-amount="allowanceAmount" 
            :desired-amount="desiredAmount"
            :is-loading="isLoading"
            :disabled="disabled"
            :is-correct.sync="isCorrect"
            :isExplanationsShown="isExplanationsShown"
            @setAllowanceAmount="setAllowanceAmount" 
        />`,
};

storiesOf('Panels/AllowanceAmountCheckPanel', module)
    .add('Within Allowance', () => ({
        ...common,
        data() {
            return {
                ...common.data(),
                allowanceAmount: new BigNumber(faker.finance.amount(100, 200)),
                desiredAmount: new BigNumber(faker.finance.amount(0, 100)),
            };
        },
    }))
    .add('Exceeds Allowance', () => ({
        ...common,
    }))
    .add('Unlimited Allowance', () => ({
        ...common,
        data() {
            return {
                ...common.data(),
                allowanceAmount: new BigNumber(Number.MAX_VALUE),
            };
        },
    }))
    .add('Missing Allowance Amount', () => ({
        ...common,
        data() {
            return {
                ...common.data(),
                allowanceAmount: undefined,
            };
        },
    }))
    .add('Missing Desired Amount', () => ({
        ...common,
        data() {
            return {
                ...common.data(),
                desiredAmount: undefined,
            };
        },
    }))
    .add('Desired Amount is NaN', () => ({
        ...common,
        data() {
            return {
                ...common.data(),
                desiredAmount: new BigNumber(NaN),
            };
        },
    }))
    .add('Loading', () => ({
        ...common,
        data() {
            return {
                ...common.data(),
                isLoading: true,
            };
        },
    }))
    .add('Disabled', () => ({
        ...common,
        data() {
            return {
                ...common.data(),
                disabled: true,
            };
        },
    }))
    .add('Expert Mode', () => ({
        ...common,
        data() {
            return {
                ...common.data(),
                isExplanationsShown: false,
            };
        },
    }));

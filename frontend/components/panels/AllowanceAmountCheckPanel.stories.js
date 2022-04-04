import { storiesOf } from '@storybook/vue';
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
        };
    },
    methods: {
        setAllowanceAmount(amount) {
            this.isLoading = true;
            setTimeout(() => {
                this.allowanceAmount = amount;
                this.isLoading = false;
            }, 1000);
        },
    },
};

storiesOf('Panels/AllowanceAmountCheckPanel', module)
    .add('Within Allowance', () => ({
        ...common,
        data() {
            return {
                allowanceAmount: new BigNumber(faker.finance.amount(100, 200)),
                desiredAmount: new BigNumber(faker.finance.amount(0, 100)),
                isLoading: false,
            };
        },
        template: `
        <AllowanceAmountCheckPanel 
            :allowance-amount="allowanceAmount" 
            :desired-amount="desiredAmount"
            :is-loading="isLoading"
            @setAllowanceAmount="setAllowanceAmount" 
        />`,
    }))
    .add('Exceeds Allowance', () => ({
        ...common,
        template: `
        <AllowanceAmountCheckPanel
            :allowance-amount="allowanceAmount" 
            :desired-amount="desiredAmount"
            :is-loading="isLoading"
            @setAllowanceAmount="setAllowanceAmount"
        />`,
    }))
    .add('Unlimited Allowance', () => ({
        ...common,
        data() {
            return {
                allowanceAmount: new BigNumber('99999999999999999999999999999999999999999999999999'),
                desiredAmount: new BigNumber(faker.finance.amount(0, 100)),
                isLoading: false,
            };
        },
        template: `
        <AllowanceAmountCheckPanel
            :allowance-amount="allowanceAmount"
            :desired-amount="desiredAmount"
            :is-loading="isLoading"
            @setAllowanceAmount="setAllowanceAmount"
        />`,
    }))
    .add('Missing Allowance Amount', () => ({
        ...common,
        data() {
            return {
                allowanceAmount: undefined,
                desiredAmount: new BigNumber(faker.finance.amount(0, 100)),
                isLoading: false,
            };
        },
        template: `
        <AllowanceAmountCheckPanel
            :allowance-amount="allowanceAmount" 
            :desired-amount="desiredAmount"
            :is-loading="isLoading"
            @setAllowanceAmount="setAllowanceAmount" 
        />`,
    }))
    .add('Missing Desired Amount', () => ({
        ...common,
        data() {
            return {
                allowanceAmount: new BigNumber(faker.finance.amount(100, 200)),
                desiredAmount: undefined,
                isLoading: false,
            };
        },
        template: `
        <AllowanceAmountCheckPanel 
            :allowance-amount="allowanceAmount" 
            :desired-amount="desiredAmount"
            :is-loading="isLoading"
            @setAllowanceAmount="setAllowanceAmount"
        />`,
    }))
    .add('Loading', () => ({
        ...common,
        template: `
        <AllowanceAmountCheckPanel 
            :allowance-amount="allowanceAmount" 
            :desired-amount="desiredAmount"
            is-loading
            @setAllowanceAmount="setAllowanceAmount"
        />`,
    }))
    .add('Disabled', () => ({
        ...common,
        template: `
        <AllowanceAmountCheckPanel 
            :allowance-amount="allowanceAmount" 
            :desired-amount="desiredAmount"
            :is-loading="isLoading"
            @setAllowanceAmount="setAllowanceAmount"
            disabled
        />`,
    }))
    .add('Expert Mode', () => ({
        ...common,
        template: `
        <AllowanceAmountCheckPanel 
            :allowance-amount="allowanceAmount" 
            :desired-amount="desiredAmount"
            :is-loading="isLoading"
            @setAllowanceAmount="setAllowanceAmount"
            :is-explanations-shown="false"
        />`,
    }));

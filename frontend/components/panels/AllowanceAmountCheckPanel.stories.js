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
        };
    },
};

storiesOf('Panels/AllowanceAmountCheckPanel', module)
    .add('Within Allowance', () => ({
        ...common,
        data() {
            return {
                allowanceAmount: new BigNumber(faker.finance.amount(100, 200)),
                desiredAmount: new BigNumber(faker.finance.amount(0, 100)),
            };
        },
        template: `
        <AllowanceAmountCheckPanel 
            :allowanceAmount="allowanceAmount" 
            :desiredAmount="desiredAmount"
            @setAllowanceAmount="allowanceAmount = $event" 
        />`,
    }))
    .add('Exceeds Allowance', () => ({
        ...common,
        template: `
        <AllowanceAmountCheckPanel 
            :allowanceAmount="allowanceAmount" 
            :desiredAmount="desiredAmount"
            @setAllowanceAmount="allowanceAmount = $event" 
        />`,
    }))
    .add('Missing Allowance Amount', () => ({
        ...common,
        data() {
            return {
                allowanceAmount: undefined,
                desiredAmount: new BigNumber(faker.finance.amount(0, 100)),
            };
        },
        template: `
            <AllowanceAmountCheckPanel 
                :allowanceAmount="allowanceAmount" 
                :desiredAmount="desiredAmount"
                @setAllowanceAmount="allowanceAmount = $event" 
            />`,
    }))
    .add('Missing Desired Amount', () => ({
        ...common,
        data() {
            return {
                allowanceAmount: new BigNumber(faker.finance.amount(100, 200)),
                desiredAmount: undefined,
            };
        },
        template: `
            <AllowanceAmountCheckPanel 
                :allowanceAmount="allowanceAmount" 
                :desiredAmount="desiredAmount"
                @setAllowanceAmount="allowanceAmount = $event" 
            />`,
    }))
    .add('Loading', () => ({
        ...common,
        template: `
        <AllowanceAmountCheckPanel 
            :allowanceAmount="allowanceAmount" 
            :desiredAmount="desiredAmount"
            @setAllowanceAmount="allowanceAmount = $event"
            is-loading
        />`,
    }))
    .add('Disabled', () => ({
        ...common,
        template: `
        <AllowanceAmountCheckPanel 
            :allowanceAmount="allowanceAmount" 
            :desiredAmount="desiredAmount"
            @setAllowanceAmount="allowanceAmount = $event"
            disabled
        />`,
    }))
    .add('Expert Mode', () => ({
        ...common,
        template: `
        <AllowanceAmountCheckPanel 
            :allowanceAmount="allowanceAmount" 
            :desiredAmount="desiredAmount"
            @setAllowanceAmount="allowanceAmount = $event"
            :is-explanations-shown="false"
        />`,
    }));

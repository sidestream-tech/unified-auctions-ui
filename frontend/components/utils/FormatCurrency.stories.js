import BigNumber from 'bignumber.js';
import { storiesOf } from '@storybook/vue';
import faker from 'faker';
import FormatCurrency from '~/components/utils/FormatCurrency';

const common = {
    components: { FormatCurrency },
};

storiesOf('Utils/FormatCurrency', module)
    .add('Default', () => ({
        ...common,
        data: () => ({ amount: Number(faker.finance.amount()) }),
        template: '<FormatCurrency :value="amount" currency="dai" />',
    }))
    .add('Big Number', () => ({
        ...common,
        data: () => ({ amount: new BigNumber(faker.finance.amount()) }),
        template: '<FormatCurrency :value="amount" currency="dai" />',
    }))
    .add('Big Number NaN', () => ({
        ...common,
        data: () => ({ amount: new BigNumber('NaN') }),
        template: '<FormatCurrency :value="amount" currency="dai" />',
    }))
    .add('With Zero', () => ({
        ...common,
        template: '<FormatCurrency :value="0" currency="dai" />',
    }))
    .add('No value', () => ({
        ...common,
        template: '<FormatCurrency currency="dai" />',
    }))
    .add('Number 0.000454786546', () => ({
        ...common,
        template: '<FormatCurrency :value="0.000454786546" currency="dai" />',
    }))
    .add('Number 0.0000000000001', () => ({
        ...common,
        template: '<FormatCurrency :value="0.0000000000001" currency="dai" />',
    }))
    .add('Negative Number -10.0', () => ({
        ...common,
        template: '<FormatCurrency :value="-10.0" currency="dai" />',
    }))
    .add('Big Number 0.0004547', () => ({
        ...common,
        data: () => ({ amount: new BigNumber(0.0004547) }),
        template: '<FormatCurrency :value="amount" currency="dai" />',
    }))
    .add('Big Number 0.0000000000001', () => ({
        ...common,
        data: () => ({ amount: new BigNumber(0.0000000000001) }),
        template: '<FormatCurrency :value="amount" currency="dai" />',
    }))
    .add('Negative Big Number -0.0000000000001', () => ({
        ...common,
        data: () => ({ amount: new BigNumber(-0.0000000000001) }),
        template: '<FormatCurrency :value="amount" currency="dai" />',
    }));

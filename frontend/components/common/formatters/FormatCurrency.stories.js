import BigNumber from 'bignumber.js';
import { storiesOf } from '@storybook/vue';
import faker from 'faker';
import FormatCurrency from './FormatCurrency';

const common = {
    components: { FormatCurrency },
};

storiesOf('Common/Formatters/FormatCurrency', module)
    .add('Empty / No value', () => ({
        ...common,
        template: '<FormatCurrency currency="dai" />',
    }))
    .add('Number', () => ({
        ...common,
        data: () => ({ amount: Number(faker.finance.amount()) }),
        template: '<FormatCurrency :value="amount" currency="dai" />',
    }))
    .add('BigNumber', () => ({
        ...common,
        data: () => ({ amount: new BigNumber(faker.finance.amount()) }),
        template: '<FormatCurrency :value="amount" currency="dai" />',
    }))
    .add('Number NaN', () => ({
        ...common,
        data: () => ({ amount: NaN }),
        template: '<FormatCurrency :value="amount" currency="dai" />',
    }))
    .add('BigNumber NaN', () => ({
        ...common,
        data: () => ({ amount: new BigNumber('NaN') }),
        template: '<FormatCurrency :value="amount" currency="dai" />',
    }))
    .add('Number 0', () => ({
        ...common,
        template: '<FormatCurrency :value="0" currency="dai" />',
    }))
    .add('BigNumber 0', () => ({
        ...common,
        data: () => ({ amount: new BigNumber(0.0) }),
        template: '<FormatCurrency :value="amount" currency="dai" />',
    }))
    .add('Number 0.000454786546', () => ({
        ...common,
        template: '<FormatCurrency :value="0.000454786546" currency="dai" />',
    }))
    .add('BigNumber 0.000454786546', () => ({
        ...common,
        data: () => ({ amount: new BigNumber(0.000454786546) }),
        template: '<FormatCurrency :value="amount" currency="dai" />',
    }))
    .add('Number 0.0000000000001', () => ({
        ...common,
        template: '<FormatCurrency :value="0.0000000000001" currency="dai" />',
    }))
    .add('BigNumber 0.0000000000001', () => ({
        ...common,
        data: () => ({ amount: new BigNumber(0.0000000000001) }),
        template: '<FormatCurrency :value="amount" currency="dai" />',
    }))
    .add('Number negative 0.0000000000001', () => ({
        ...common,
        template: '<FormatCurrency :value="-0.0000000000001" currency="dai" />',
    }))
    .add('BigNumber negative 0.0000000000001', () => ({
        ...common,
        data: () => ({ amount: new BigNumber(-0.0000000000001) }),
        template: '<FormatCurrency :value="amount" currency="dai" />',
    }))
    .add('Number negative 10', () => ({
        ...common,
        template: '<FormatCurrency :value="-10" currency="dai" />',
    }))
    .add('BigNumber negative 10', () => ({
        ...common,
        data: () => ({ amount: new BigNumber(-10) }),
        template: '<FormatCurrency :value="amount" currency="dai" />',
    }));

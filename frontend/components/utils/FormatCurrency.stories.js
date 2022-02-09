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
        data() {
            return {
                amount: Number(faker.finance.amount()),
            };
        },
        template: '<FormatCurrency :value="amount" currency="dai" />',
    }))
    .add('Big Number', () => ({
        ...common,
        data() {
            return {
                amount: BigNumber(faker.finance.amount()),
            };
        },
        template: '<FormatCurrency :value="amount" currency="dai" />',
    }))
    .add('Big Number NaN', () => ({
        ...common,
        data() {
            return {
                amount: BigNumber('NaN'),
            };
        },
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
    .add('Number under 0.01', () => ({
        ...common,
        template: '<FormatCurrency :value="0.000454786546754578645678546874546789" currency="dai" />',
    }))
    .add('Number under 0.000001', () => ({
        ...common,
        template: '<FormatCurrency :value="0.0000000000001" currency="dai" />',
    }))
    .add('Big Number under 0.01', () => ({
        ...common,
        data() {
            return {
                amount: BigNumber(0.0004547),
            };
        },
        template: '<FormatCurrency :value="amount" currency="dai" />',
    }))
    .add('Big Number under 0.000001', () => ({
        ...common,
        data() {
            return {
                amount: BigNumber(0.0000000000001),
            };
        },
        template: '<FormatCurrency :value="amount" currency="dai" />',
    }));

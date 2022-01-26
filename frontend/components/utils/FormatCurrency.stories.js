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
                amount: BigNumber("NaN"),
            };
        },
        template: '<FormatCurrency :value="amount" currency="dai" />',
    }))
    .add('No value', () => ({
        ...common,
        template: '<FormatCurrency currency="dai" />',
    }));

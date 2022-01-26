import { storiesOf } from '@storybook/vue';
import faker from 'faker';
import BigNumber from 'bignumber.js';
import AnimatedNumber from '~/components/utils/AnimatedNumber';

const common = {
    components: {
        AnimatedNumber,
    },
    data() {
        return {
            num: faker.datatype.number(),
        };
    },
    mounted() {
        setInterval(() => {
            this.num = faker.datatype.number();
        }, 6000);
    },
};

storiesOf('Utils/AnimatedNumber', module)
    .add('Default', () => ({
        ...common,
        template: `<AnimatedNumber :value="num"/>`,
    }))
    .add('Long Duration', () => ({
        ...common,
        template: `<AnimatedNumber :value="num" :duration="5000"/>`,
    }))
    .add('Empty Value', () => ({
        ...common,
        template: `<AnimatedNumber />`,
    }))
    .add('Zero', () => ({
        ...common,
        template: `<AnimatedNumber :value="0" />`,
    }))
    .add('Big Number', () => ({
        components: {
            AnimatedNumber,
        },
        data() {
            return {
                amount: BigNumber(faker.finance.amount()),
            };
        },
        mounted() {
            setInterval(() => {
                this.amount = BigNumber(faker.finance.amount());
            }, 6000);
        },
        template: `<AnimatedNumber :value="amount" />`,
    }));

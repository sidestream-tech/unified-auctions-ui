import { storiesOf } from '@storybook/vue';
import { action } from '@storybook/addon-actions';
import RestartBlock from '~/components/transaction/RestartBlock';

const common = {
    components: { RestartBlock },
    data() {
        return {
            restartFee: 0.4,
        };
    },
    methods: {
        restart: action('restart auction'),
    },
};

storiesOf('Transaction/RestartBlock', module).add('Default', () => ({
    ...common,
    template: '<RestartBlock :transaction-fee="restartFee" @restart="restart" />',
}));

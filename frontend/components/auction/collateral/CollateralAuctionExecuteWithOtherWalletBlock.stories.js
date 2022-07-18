import { storiesOf } from '@storybook/vue';
import faker from 'faker';
import { action } from '@storybook/addon-actions';
import ExecuteWithOtherWalletBlock from '~/components/transaction/ExecuteWithOtherWalletBlock';

const common = {
    components: { ExecuteWithOtherWalletBlock },
    data() {
        return {
            outcomeWallet: faker.finance.ethereumAddress(),
            defaultWallet: faker.finance.ethereumAddress(),
        };
    },
    methods: {
        execute: action('execute'),
    },
};

storiesOf('Transaction/ExecuteWithOtherWalletBlock', module).add('Default', () => ({
    ...common,
    template:
        '<ExecuteWithOtherWalletBlock :outcomeWallet="outcomeWallet" :defaultWallet="defaultWallet" @execute="execute" />',
}));

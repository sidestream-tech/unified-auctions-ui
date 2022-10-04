import { storiesOf } from '@storybook/vue';
import faker from 'faker';
import { action } from '@storybook/addon-actions';
import ExecuteWithOtherWalletModal from '~/components/modals/ExecuteWithOtherWalletModal';

const common = {
    components: { ExecuteWithOtherWalletModal },
    data() {
        return {
            defaultWallet: faker.finance.ethereumAddress(),
        };
    },
    methods: {
        execute: action('execute'),
    },
};

storiesOf('Modals/ExecuteWithOtherWalletModal', module).add('Default', () => ({
    ...common,
    template: '<ExecuteWithOtherWalletModal :isShown="true" :defaultWallet="defaultWallet" @execute="execute" />',
}));

import { storiesOf } from '@storybook/vue';
import { action } from '@storybook/addon-actions';
import WalletSelectModal from './WalletSelectModal';

const common = {
    components: { WalletSelectModal },
    data: () => ({
        isShown: true,
    }),
    methods: {
        submit: action('submit'),
    },
};

storiesOf('Modals/WalletSelectModal', module).add('Default', () => ({
    ...common,
    template: '<WalletSelectModal :isShown="isShown" @submit="submit" />',
}));

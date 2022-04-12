import { storiesOf } from '@storybook/vue';
import WalletSelector from './WalletSelector.vue';

storiesOf('Modals/WalletSelector', module).add('Default', () => ({
    components: { WalletSelector },
    template: `<WalletSelector/>`,
}));

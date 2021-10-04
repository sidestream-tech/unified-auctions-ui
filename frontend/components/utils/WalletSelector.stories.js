import { storiesOf } from '@storybook/vue';
import WalletSelector from './WalletSelector.vue';

storiesOf('WalletSelector/WalletSelector', module).add('Default', () => ({
    components: { WalletSelector },
    template: `<WalletSelector/>`,
}));

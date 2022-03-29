import { storiesOf } from '@storybook/vue';
import WalletDaiCheckPanel from './WalletDaiCheckPanel.vue';

storiesOf('Panels/WalletDaiCheckPanel', module).add('Default', () => ({
    components: { WalletDaiCheckPanel },
    template: `<WalletDaiCheckPanel/>`,
}));

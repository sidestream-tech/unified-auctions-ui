import { storiesOf } from '@storybook/vue';
import WalletAuthorizationCheckPanel from './WalletAuthorizationCheckPanel';

const common = {
    components: { WalletAuthorizationCheckPanel },
};

storiesOf('Panels/WalletAuthorizationCheckPanel', module).add('Default', () => ({
    ...common,
    template: '<WalletAuthorizationCheckPanel />',
}));

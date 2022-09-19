import { storiesOf } from '@storybook/vue';
import { action } from '@storybook/addon-actions';
import ChangeWalletNetworkModal from './ChangeWalletNetworkModal';

const common = {
    components: { ChangeWalletNetworkModal },
    methods: {
        setPageNetwork: action('setPageNetwork'),
        fixWalletNetwork: action('fixWalletNetwork'),
    },
};

storiesOf('Modals/ChangeWalletNetworkModal', module).add('Default', () => ({
    ...common,
    template: `<ChangeWalletNetworkModal
        invalid-network="invalid-network"
        page-network="mainnet"
        @setPageNetwork="setPageNetwork"
        @fixWalletNetwork="fixWalletNetwork"
    />`,
}));

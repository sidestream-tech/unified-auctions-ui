import { storiesOf } from '@storybook/vue';
import { action } from '@storybook/addon-actions';
import ChangeWalletNetworkModal from './ChangeWalletNetworkModal';
import { generateFakeNetworks } from '~/helpers/generateFakeNetwork';

const networks = generateFakeNetworks(3);

const common = {
    components: { ChangeWalletNetworkModal },
    data: () => ({
        networks,
    }),
    methods: {
        setPageNetwork: action('setPageNetwork'),
        fixWalletNetwork: action('fixWalletNetwork'),
    },
};

storiesOf('Modals/ChangeWalletNetworkModal', module).add('Default', () => ({
    ...common,
    template: `<ChangeWalletNetworkModal
        :networks="networks"
        invalid-network="invalid-network"
        page-network="kovan"
        @setPageNetwork="setPageNetwork"
        @fixWalletNetwork="fixWalletNetwork"
    />`,
}));

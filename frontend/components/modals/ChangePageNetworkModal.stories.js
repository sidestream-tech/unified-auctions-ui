import { storiesOf } from '@storybook/vue';
import { action } from '@storybook/addon-actions';
import ChangePageNetworkModal from './ChangePageNetworkModal';
import { generateFakeNetworks } from '~/helpers/generateFakeNetwork';

const networks = generateFakeNetworks(3);

const common = {
    components: { ChangePageNetworkModal },
    data: () => ({
        chainId: '0x5',
        networks,
    }),
    methods: {
        setNetwork: action('setNetwork'),
    },
};

storiesOf('Modals/ChangePageNetworkModal', module)
    .add('Default', () => ({
        ...common,
        template:
            '<ChangePageNetworkModal :invalid-network="chainId" @setNetwork="setNetwork" :networks="networks" />',
    }))
    .add('No networks', () => ({
        ...common,
        template: '<ChangePageNetworkModal :invalid-network="chainId" @setNetwork="setNetwork" />',
    }))
    .add('Dev Mode', () => ({
        ...common,
        template:
            '<ChangePageNetworkModal :invalid-network="chainId" @setNetwork="setNetwork" :networks="networks" is-dev />',
    }));

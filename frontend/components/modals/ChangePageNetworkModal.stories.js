import { storiesOf } from '@storybook/vue';
import { action } from '@storybook/addon-actions';
import ChangePageNetworkModal from './ChangePageNetworkModal';

const common = {
    components: { ChangePageNetworkModal },
    data: () => ({
        chainId: '0x5',
    }),
    methods: {
        setNetwork: action('setNetwork'),
    },
};

storiesOf('Modals/ChangePageNetworkModal', module)
    .add('Default', () => ({
        ...common,
        template: '<ChangePageNetworkModal :invalid-network="chainId" @setNetwork="setNetwork" />',
    }))
    .add('Dev Mode', () => ({
        ...common,
        template: '<ChangePageNetworkModal :invalid-network="chainId" @setNetwork="setNetwork" is-dev />',
    }));

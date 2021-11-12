import { storiesOf } from '@storybook/vue';
import { action } from '@storybook/addon-actions';
import ForceNetworkModal from '~/components/ForceNetworkModal';

const common = {
    components: { ForceNetworkModal },
    data: () => ({
        chainId: '0x5',
    }),
    methods: {
        updateNetwork(newNetwork) {
            action('UpdatedNetwork')(newNetwork);
        },
    },
};

storiesOf('Modals/ForceNetworkModal', module).add('Default', () => ({
    ...common,
    template: '<ForceNetworkModal :is-invalid-network="true" :chain-id="chainId" @updateNetwork="updateNetwork" />',
}));

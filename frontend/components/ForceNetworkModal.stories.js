import { storiesOf } from '@storybook/vue';
import { action } from '@storybook/addon-actions';
import ForceNetworkModal from '~/components/ForceNetworkModal';

const common = {
    components: { ForceNetworkModal },
    data: () => ({
        invalidNetwork: '0x4',
    }),
    methods: {
        updateNetwork(newNetwork) {
            action('UpdatedNetwork')(newNetwork);
        },
    },
};

storiesOf('ForceNetworkModal', module).add('Default', () => ({
    ...common,
    template: '<ForceNetworkModal :invalid-network="invalidNetwork" @updateNetwork="updateNetwork" />',
}));

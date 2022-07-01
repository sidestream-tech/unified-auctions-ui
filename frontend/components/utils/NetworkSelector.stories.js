import { storiesOf } from '@storybook/vue';
import { action } from '@storybook/addon-actions';
import NetworkSelector from '~/components/utils/NetworkSelector';
import { generateFakeNetworks } from '~/helpers/generateFakeNetwork';

const common = {
    components: { NetworkSelector },
    methods: {
        select: action('select'),
        networks: generateFakeNetworks(),
    },
};

storiesOf('Utils/NetworkSelector', module)
    .add('Default', () => ({
        ...common,
        template: '<network-selector :networks="networks" @select="select"/>',
    }))
    .add('Changing Network', () => ({
        ...common,
        data: () => ({
            isChangingNetwork: true,
        }),
        template:
            '<network-selector :networks="networks" :is-changing-network="isChangingNetwork" @select="select" />',
    }));

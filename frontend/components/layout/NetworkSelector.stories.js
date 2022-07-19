import { storiesOf } from '@storybook/vue';
import { action } from '@storybook/addon-actions';
import NetworkSelector from './NetworkSelector';
import { generateFakeNetworks } from '~/helpers/generateFakeNetwork';

const common = {
    components: { NetworkSelector },
    methods: {
        select: action('select'),
    },
    computed: {
        networks: () => generateFakeNetworks(),
    },
};

storiesOf('Layout/NetworkSelector', module)
    .add('Default', () => ({
        ...common,
        template: '<network-selector :networks="networks" @select="select"/>',
    }))
    .add('Changing Network', () => ({
        ...common,
        template: '<network-selector :networks="networks" :is-changing-network="true" @select="select" />',
    }));

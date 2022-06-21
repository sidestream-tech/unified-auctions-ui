import { storiesOf } from '@storybook/vue';
import { action } from '@storybook/addon-actions';
import NetworkSelector from '~/components/utils/NetworkSelector';
import { generateFakeNetworks } from '~/helpers/generateFakeNetwork';

const networks = generateFakeNetworks(3);

const common = {
    components: { NetworkSelector },
    data: () => ({
        networks,
    }),
    methods: {
        select: action('select'),
    },
};

storiesOf('Utils/NetworkSelector', module)
    .add('Default', () => ({
        ...common,
        template: '<network-selector :networks="networks" @select="select"/>',
    }))
    .add('Dev Mode', () => ({
        ...common,
        template: '<network-selector :networks="networks" @select="select" is-dev />',
    }))
    .add('No networks', () => ({
        ...common,
        template: '<network-selector @select="select" is-dev />',
    }));

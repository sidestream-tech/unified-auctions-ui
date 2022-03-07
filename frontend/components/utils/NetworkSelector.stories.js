import { storiesOf } from '@storybook/vue';
import { action } from '@storybook/addon-actions';
import NetworkSelector from '~/components/utils/NetworkSelector';

const common = {
    components: { NetworkSelector },
    methods: {
        select: action('select'),
    },
};

storiesOf('Utils/NetworkSelector', module)
    .add('Default', () => ({
        ...common,
        template: '<network-selector @select="select"/>',
    }))
    .add('Dev Mode', () => ({
        ...common,
        template: '<network-selector @select="select" is-dev />',
    }));

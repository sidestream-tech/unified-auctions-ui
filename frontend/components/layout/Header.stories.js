import { storiesOf } from '@storybook/vue';
import { action } from '@storybook/addon-actions';
import Header from '~/components/layout/Header';

const common = {
    components: { Header },
    methods: {
        updateNetwork: action('updateNetwork'),
        updateIsExplanationsShown: action('updateIsExplanationsShown'),
    },
    data: () => ({
        network: null,
        isExplanationsShown: true,
    }),
};

storiesOf('Layout/Header', module)
    .add('Default', () => ({
        ...common,
        template: `<Header
        :network.sync="network"
        :isExplanationsShown.sync="isExplanationsShown"
        @update:network="updateNetwork"
        @update:isExplanationsShown="updateIsExplanationsShown"
    />`,
    }))
    .add('Unified Auctions Page', () => ({
        ...common,
        template: `<Header
        type="unified" 
        :isExplanationsShown.sync="isExplanationsShown"
        @update:isExplanationsShown="updateIsExplanationsShown"
        />`,
    }));

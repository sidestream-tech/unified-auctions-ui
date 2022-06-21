import { storiesOf } from '@storybook/vue';
import { action } from '@storybook/addon-actions';
import Header from '~/components/layout/Header';
import { generateFakeNetworks } from '~/helpers/generateFakeNetwork';

const networks = generateFakeNetworks(3);

const common = {
    components: { Header },
    methods: {
        updateNetwork: action('updateNetwork'),
        updateIsExplanationsShown: action('updateIsExplanationsShown'),
    },
    data: () => ({
        network: null,
        isExplanationsShown: true,
        networks,
    }),
};

storiesOf('Layout/Header', module)
    .add('Default', () => ({
        ...common,
        template: `<Header
        :networks="networks"
        :network.sync="network"
        :isExplanationsShown.sync="isExplanationsShown"
        @update:network="updateNetwork"
        @update:isExplanationsShown="updateIsExplanationsShown"
    />`,
    }))
    .add('Dev Mode', () => ({
        ...common,
        template: `<Header
        :networks="networks"
        :network.sync="network"
        :isExplanationsShown.sync="isExplanationsShown"
        @update:network="updateNetwork"
        @update:isExplanationsShown="updateIsExplanationsShown"
        is-dev
    />`,
    }))
    .add('Unified Auctions Page', () => ({
        ...common,
        template: `<Header
        type="unified" 
        :isExplanationsShown.sync="isExplanationsShown"
        @update:isExplanationsShown="updateIsExplanationsShown"
        />`,
    }))
    .add('With Staging header', () => ({
        ...common,
        template: `<Header
        type="unified" 
        :isExplanationsShown.sync="isExplanationsShown"
        :isStagingEnvironment="true"
        @update:isExplanationsShown="updateIsExplanationsShown"
        />`,
    }));

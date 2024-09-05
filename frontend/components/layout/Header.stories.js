import { storiesOf } from '@storybook/vue';
import { action } from '@storybook/addon-actions';
import Header from './Header';

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
    .add('Dev Mode', () => ({
        ...common,
        template: `<Header
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
    .add('Minimal', () => ({
        ...common,
        template: `<Header
        type="minimal"
        :isExplanationsShown.sync="isExplanationsShown"
        @update:isExplanationsShown="updateIsExplanationsShown"
        />`,
    }))
    .add('With Staging Banner', () => ({
        ...common,
        template: `<Header
        type="unified"
        :isExplanationsShown.sync="isExplanationsShown"
        stagingBannerUrl="https://example.com/"
        @update:isExplanationsShown="updateIsExplanationsShown"
        />`,
    }))
    .add('With Production header', () => ({
        ...common,
        template: `<Header
        type="unified"
        :isExplanationsShown.sync="isExplanationsShown"
        @update:isExplanationsShown="updateIsExplanationsShown"
        />`,
    }))
    .add('Surplus Auctions Page', () => ({
        ...common,
        template: `<Header
        type="auctions"
        pageName="surplus"
        :isExplanationsShown.sync="isExplanationsShown"
        :isStagingEnvironment="true"
        @update:isExplanationsShown="updateIsExplanationsShown"
        />`,
    }));

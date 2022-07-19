import { storiesOf } from '@storybook/vue';
import FeatureItems from './FeatureItems';
import features from '~/data/FeatureTexts';

const common = {
    components: { FeatureItems },
    data() {
        return {
            features,
        };
    },
};

storiesOf('Common/Other/FeatureItems', module)
    .add('Collateral Auctions UI', () => ({
        ...common,
        template: '<FeatureItems :items="features[0].items"/>',
    }))
    .add('Unified auctions portal', () => ({
        ...common,
        template: '<FeatureItems :items="features[1].items"/>',
    }))
    .add('Collateral auctions - dashboard page', () => ({
        ...common,
        template: '<FeatureItems :items="features[2].items"/>',
    }))
    .add('Twitter Bot', () => ({
        ...common,
        template: '<FeatureItems :items="features[3].items"/>',
    }))
    .add('Auction Keeper', () => ({
        ...common,
        template: '<FeatureItems :items="features[4].items"/>',
    }));

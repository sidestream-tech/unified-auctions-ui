import { storiesOf } from '@storybook/vue';
import FeaturesView from './FeaturesView.vue';

storiesOf('Common/Other/FeaturesView', module).add('Default', () => ({
    components: { FeaturesView },
    template: '<FeaturesView />',
}));

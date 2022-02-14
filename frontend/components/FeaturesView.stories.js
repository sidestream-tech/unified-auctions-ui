import { storiesOf } from '@storybook/vue';
import FeaturesView from './FeaturesView.vue';

storiesOf('Features View', module).add('Default', () => ({
    components: { FeaturesView },
    template: '<FeaturesView />',
}));

import { storiesOf } from '@storybook/vue';
import FeatureList from './FeatureList';

storiesOf('FeatureList', module).add('Default', () => ({
    components: { FeatureList },
    template: `<FeatureList />`,
}));

import { storiesOf } from '@storybook/vue';
import FeatureList from './FeatureList';

storiesOf('Common/Other/FeatureList', module).add('Default', () => ({
    components: { FeatureList },
    template: `<FeatureList />`,
}));

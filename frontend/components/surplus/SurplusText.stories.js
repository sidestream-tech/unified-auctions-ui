import { storiesOf } from '@storybook/vue';
import SurplusText from './SurplusText';

const common = {
    components: { SurplusText },
};

storiesOf('Surplus/SurplusText', module).add('Default', () => ({
    ...common,
    template: '<SurplusText />',
}));

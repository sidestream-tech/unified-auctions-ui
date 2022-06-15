import { storiesOf } from '@storybook/vue';
import SurplusFlow from './SurplusFlow';

const common = {
    components: { SurplusFlow },
};

storiesOf('Surplus/SurplusFlow', module)
    .add('Default', () => ({
        ...common,
        template: '<SurplusFlow />',
    }))
    .add('Expert Mode', () => ({
        ...common,
        template: '<SurplusFlow :isExplanationsShown="false" />',
    }));

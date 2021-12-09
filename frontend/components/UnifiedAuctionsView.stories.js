import { storiesOf } from '@storybook/vue';
import UnifiedAuctionsView from './UnifiedAuctionsView.vue';

storiesOf('UnifiedAuctionsView', module)
    .add('Default', () => ({
        components: { UnifiedAuctionsView },
        template: '<UnifiedAuctionsView />',
    }))
    .add('Expert Mode', () => ({
        components: { UnifiedAuctionsView },
        template: '<UnifiedAuctionsView :is-explanations-shown="false" />',
    }));

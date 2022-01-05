import { storiesOf } from '@storybook/vue';
import DashboardAuctionsView from './DashboardAuctionsView.vue';

storiesOf('DashboardAuctionsView', module)
    .add('Default', () => ({
        components: { DashboardAuctionsView },
        template: '<DashboardAuctionsView />',
    }))
    .add('Expert Mode', () => ({
        components: { DashboardAuctionsView },
        template: '<DashboardAuctionsView :is-explanations-shown="false" />',
    }));

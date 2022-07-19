import { storiesOf } from '@storybook/vue';
import DashboardAuctionsView from './DashboardAuctionsView.vue';
import { generateFakeCollaterals } from '~/helpers/generateFakeCollateral';
import { generateFakeCallees } from '~/helpers/generateFakeCallee';

const common = {
    components: { DashboardAuctionsView },
    data: () => ({
        collaterals: generateFakeCollaterals(),
        callees: generateFakeCallees(),
    }),
};

storiesOf('Dashboard/DashboardAuctionsView', module)
    .add('Default', () => ({
        ...common,
        template: '<DashboardAuctionsView :collaterals="collaterals" :callees="callees" />',
    }))
    .add('Expert Mode', () => ({
        ...common,
        template:
            '<DashboardAuctionsView :collaterals="collaterals" :is-explanations-shown="false" :callees="callees" />',
    }))
    .add('Empty Collateral List', () => ({
        ...common,
        template: '<DashboardAuctionsView :callees="callees" />',
    }));

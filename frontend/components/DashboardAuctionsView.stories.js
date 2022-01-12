import { storiesOf } from '@storybook/vue';
import DashboardAuctionsView from './DashboardAuctionsView.vue';

import { generateFakeCollaterals } from '~/helpers/generateFakeCollateral';

const collaterals = generateFakeCollaterals();

const common = {
    components: { DashboardAuctionsView },
    data: () => ({
        collaterals,
    }),
};

storiesOf('DashboardAuctionsView', module)
    .add('Default', () => ({
        ...common,
        template: '<DashboardAuctionsView :collaterals="collaterals" />',
    }))
    .add('Expert Mode', () => ({
        ...common,
        template: '<DashboardAuctionsView :collaterals="collaterals" :is-explanations-shown="false" />',
    }))
    .add('Empty Collateral List', () => ({
        ...common,
        template: '<DashboardAuctionsView />',
    }));

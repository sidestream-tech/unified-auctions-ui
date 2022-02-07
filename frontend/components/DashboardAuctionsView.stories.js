import { storiesOf } from '@storybook/vue';
import DashboardAuctionsView from './DashboardAuctionsView.vue';
import { generateFakeCollaterals } from '~/helpers/generateFakeCollateral';
import { getCalleesByNetworkType } from '~/../core/src/constants/CALLEES';

const collaterals = generateFakeCollaterals();

const common = {
    components: { DashboardAuctionsView },
    data: () => ({
        collaterals,
    }),
    computed: {
        callees() {
            return getCalleesByNetworkType('mainnet');
        },
    },
};

storiesOf('DashboardAuctionsView', module)
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

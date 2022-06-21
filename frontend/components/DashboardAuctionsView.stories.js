import { storiesOf } from '@storybook/vue';
import DashboardAuctionsView from './DashboardAuctionsView.vue';
import { generateFakeCollaterals } from '~/helpers/generateFakeCollateral';
import { getCalleesByChainId } from '~/../core/src/constants/CALLEES';

const collaterals = generateFakeCollaterals();

const common = {
    components: { DashboardAuctionsView },
    data: () => ({
        collaterals,
    }),
    computed: {
        callees() {
            return getCalleesByChainId('0x1');
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

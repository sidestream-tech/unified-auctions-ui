import { storiesOf } from '@storybook/vue';
import DashboardAuctionsView from './DashboardAuctionsView.vue';

import { generateFakeCollaterals } from '~/helpers/generateFakeCollateral';

const collaterals = generateFakeCollaterals();

const common = {
    components: { DashboardAuctionsView },
    data: () => ({
        collaterals: collaterals.collaterals,
        onChainCollaterals: collaterals.onChain,
    }),
};

storiesOf('DashboardAuctionsView', module)
    .add('Default', () => ({
        ...common,
        template: '<DashboardAuctionsView :collaterals="collaterals" :on-chain-collaterals="onChainCollaterals" />',
    }))
    .add('Expert Mode', () => ({
        ...common,
        template:
            '<DashboardAuctionsView :collaterals="collaterals" :on-chain-collaterals="onChainCollaterals" :is-explanations-shown="false" />',
    }))
    .add('Empty Collateral List', () => ({
        ...common,
        template: '<DashboardAuctionsView />',
    }));

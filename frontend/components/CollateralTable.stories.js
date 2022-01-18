import { storiesOf } from '@storybook/vue';
import CollateralTable from './CollateralTable';
import { generateFakeCollaterals } from '~/helpers/generateFakeCollateral';

const collaterals = generateFakeCollaterals();

const common = {
    components: { CollateralTable },
    data: () => ({
        collaterals: collaterals.collaterals,
        onChainCollaterals: collaterals.onChain,
    }),
};

storiesOf('CollateralTable', module).add('Default', () => ({
    ...common,
    template: '<CollateralTable :collaterals="collaterals" :on-chain-collaterals="onChainCollaterals" />',
}));

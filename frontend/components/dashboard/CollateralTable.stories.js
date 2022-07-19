import { storiesOf } from '@storybook/vue';
import CollateralTable from './CollateralTable';
import { generateFakeCollaterals } from '~/helpers/generateFakeCollateral';

const collaterals = generateFakeCollaterals();

const common = {
    components: { CollateralTable },
    data: () => ({
        collaterals,
    }),
};

storiesOf('Dashboard/CollateralTable', module).add('Default', () => ({
    ...common,
    template: '<CollateralTable :collaterals="collaterals" />',
}));

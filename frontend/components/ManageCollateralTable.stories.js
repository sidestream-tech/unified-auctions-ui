import { storiesOf } from '@storybook/vue';
import ManageCollateralTable from './ManageCollateralTable';
import { generateFakeCollateralStatuses } from '~/helpers/generateFakeCollateral';

const common = {
    components: { ManageCollateralTable },
    data: () => ({
        collateralStatuses: generateFakeCollateralStatuses(),
    }),
};

storiesOf('ManageCollateralTable', module).add('Default', () => ({
    ...common,
    template: '<ManageCollateralTable :collateralStatuses="collateralStatuses" />',
}));

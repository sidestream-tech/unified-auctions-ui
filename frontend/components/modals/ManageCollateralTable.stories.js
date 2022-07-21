import { storiesOf } from '@storybook/vue';
import BigNumber from 'bignumber.js';
import ManageCollateralTable from './ManageCollateralTable';
import { generateFakeCollateralStatuses } from '~/helpers/generateFakeCollateral';

const common = {
    components: { ManageCollateralTable },
    data: () => ({
        collateralStatuses: generateFakeCollateralStatuses(),
    }),
    methods: {
        authorize(collateralType) {
            const collateralStatus = this.collateralStatuses.find(c => c.type === collateralType);
            collateralStatus.isAuthorizing = true;
            setTimeout(() => {
                collateralStatus.isAuthorized = true;
                collateralStatus.isAuthorizing = false;
            }, 1000);
        },
        withdraw(collateralType) {
            const collateralStatus = this.collateralStatuses.find(c => c.type === collateralType);
            collateralStatus.isDepositingOrWithdrawing = true;
            setTimeout(() => {
                collateralStatus.balance = new BigNumber(0);
                collateralStatus.isDepositingOrWithdrawing = false;
            }, 1000);
        },
    },
};

storiesOf('Modals/ManageCollateralTable', module).add('Default', () => ({
    ...common,
    template: `<ManageCollateralTable 
        :collateralStatuses="collateralStatuses"
        @authorizeCollateral="authorize"
        @withdrawCollateral="withdraw"  
    />`,
}));

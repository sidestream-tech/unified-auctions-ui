import { storiesOf } from '@storybook/vue';
import BigNumber from 'bignumber.js';
import ManageCollateralTable from './ManageCollateralTable';
import { generateFakeCollateralStatuses } from '~/helpers/generateFakeCollateral';

const common = {
    components: { ManageCollateralTable },
    data: () => ({
        collateralStatuses: generateFakeCollateralStatuses(),
        isExplanationsShown: true,
        isAuthorizing: false,
        isWithdrawing: false,
    }),
    methods: {
        authorize(collateralType) {
            this.isAuthorizing = true;
            setTimeout(() => {
                this.isAuthorizing = false;
                const index = this.collateralStatuses.findIndex(status => status.type === collateralType);
                this.collateralStatuses[index].isAuthorized = true;
            }, 1000);
        },
        withdraw(collateralType) {
            this.isWithdrawing = true;
            setTimeout(() => {
                this.isWithdrawing = false;
                const index = this.collateralStatuses.findIndex(status => status.type === collateralType);
                this.collateralStatuses[index].balance = new BigNumber(0);
            }, 1000);
        },
    },
};

storiesOf('ManageCollateralTable', module).add('Default', () => ({
    ...common,
    template: `
    <ManageCollateralTable 
        :collateralStatuses="collateralStatuses" 
        @authorizeCollateral="authorize"
        @withdrawCollateral="withdraw"  
    />`,
}));

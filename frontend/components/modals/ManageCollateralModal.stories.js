import { storiesOf } from '@storybook/vue';
import BigNumber from 'bignumber.js';
import ManageCollateralModal from './ManageCollateralModal';
import { generateFakeCollateralStatuses } from '~/helpers/generateFakeCollateral';

const common = {
    components: { ManageCollateralModal },
    data: () => ({
        isShown: true,
        isExplanationsShown: true,
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
    template: `<ManageCollateralModal 
        :isShown="isShown" 
        :collateralStatuses="collateralStatuses" 
        @authorizeCollateral="authorize"
        @withdrawCollateral="withdraw"
    />`,
};

storiesOf('Modals/ManageCollateralModal', module)
    .add('Default', () => ({
        ...common,
    }))
    .add('Expert Mode', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            isExplanationsShown: false,
        }),
    }));

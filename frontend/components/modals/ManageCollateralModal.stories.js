import { storiesOf } from '@storybook/vue';
import ManageCollateralModal from './ManageCollateralModal';
import { generateFakeCollateralStatuses } from '~/helpers/generateFakeCollateral';

const common = {
    components: { ManageCollateralModal },
    data: () => ({
        isShown: true,
        authorizingCollaterals: [],
        isWithdrawing: false,
        collateralStatuses: generateFakeCollateralStatuses(),
        isExplanationsShown: true,
    }),
    methods: {
        authorize(collateralType) {
            this.authorizingCollaterals.push(collateralType);
            setTimeout(() => {
                this.authorizingCollaterals.filter(collateral => collateral !== collateralType);
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
    template: `
    <ManageCollateralModal 
        :isShown="isShown" 
        :authorizingCollaterals="authorizingCollaterals" 
        :isWithdrawing="isWithdrawing" 
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

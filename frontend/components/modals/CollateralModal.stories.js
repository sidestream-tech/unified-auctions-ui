import { storiesOf } from '@storybook/vue';
import CollateralModal from './CollateralModal';
import { generateFakeCollateralStatuses } from '~/helpers/generateFakeCollateral';

const common = {
    components: { CollateralModal },
    data: () => ({
        isShown: true,
        isAuthorizing: false,
        isWithdrawing: false,
        collateralStatuses: generateFakeCollateralStatuses(),
        isExplanationsShown: true,
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
    template: `
    <CollateralModal 
        :isShown="isShown" 
        :isAuthorizing="isAuthorizing" 
        :isWithdrawing="isWithdrawing" 
        :collateralStatuses="collateralStatuses" 
        @authorizeCollateral="authorize"
        @withdrawCollateral="withdraw"
    />`,
};

storiesOf('Modals/CollateralModal', module)
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

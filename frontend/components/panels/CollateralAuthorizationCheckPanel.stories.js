import { storiesOf } from '@storybook/vue';
import { action } from '@storybook/addon-actions';
import BigNumber from 'bignumber.js';
import CollateralAuthorizationCheckPanel from './CollateralAuthorizationCheckPanel';
import { generateFakeAuctionTransaction } from '~/helpers/generateFakeAuction';

const fakeAuctionTransaction = generateFakeAuctionTransaction();

const common = {
    components: { CollateralAuthorizationCheckPanel },
    data: () => ({
        collateralType: fakeAuctionTransaction.collateralType,
        authTransactionFeeETH: new BigNumber(fakeAuctionTransaction.authTransactionFeeETH),
        isCollateralAuthorized: false,
        isLoading: false,
        disabled: false,
        isExplanationsShown: true,
    }),
    methods: {
        authorizeCollateral() {
            this.isLoading = true;
            setTimeout(() => {
                this.isCollateralAuthorized = true;
                this.isLoading = false;
            }, 1000);
        },
        isCorrect: action('isCorrect'),
    },
    template: `
    <CollateralAuthorizationCheckPanel 
        v-bind="$data"
        @authorizeCollateral="authorizeCollateral"
        @update:isCorrect="isCorrect"
    />`,
};

storiesOf('Panels/CollateralAuthorizationCheckPanel', module)
    .add('Authorized', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            isCollateralAuthorized: true,
        }),
    }))
    .add('Unauthorized', () => ({
        ...common,
    }))
    .add('Loading', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            isLoading: true,
        }),
    }))
    .add('Disabled', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            disabled: true,
        }),
    }))
    .add('Expert Mode', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            isExplanationsShown: false,
        }),
    }));

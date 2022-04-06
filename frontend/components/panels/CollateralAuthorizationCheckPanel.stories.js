import { storiesOf } from '@storybook/vue';
import { action } from '@storybook/addon-actions';
import faker from 'faker';
import BigNumber from 'bignumber.js';
import CollateralAuthorizationCheckPanel from './CollateralAuthorizationCheckPanel';
import { generateFakeAuctionTransaction } from '~/helpers/generateFakeAuction';

const fakeAuctionTransaction = generateFakeAuctionTransaction();

const common = {
    components: { CollateralAuthorizationCheckPanel },
    data: () => ({
        collateralType: fakeAuctionTransaction.collateralType,
        authTransactionFeeETH: new BigNumber(fakeAuctionTransaction.authTransactionFeeETH),
        walletAddress: faker.finance.ethereumAddress(),
        isCollateralAuthorized: false,
        isWalletAuthorized: true,
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
    .add('No wallet connected', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            isWalletAuthorized: false,
            walletAddress: null,
        }),
    }))
    .add('DAI transactions not authorized yet', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            isWalletAuthorized: false,
        }),
    }))
    .add('Collateral transactions not authorized yet', () => ({
        ...common,
    }))
    .add('Collateral transactions authorized', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            isCollateralAuthorized: true,
        }),
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
            isWalletAuthorized: true,
            isExplanationsShown: false,
        }),
    }));

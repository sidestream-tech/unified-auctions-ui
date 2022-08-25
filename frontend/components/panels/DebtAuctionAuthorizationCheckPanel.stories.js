import { storiesOf } from '@storybook/vue';
import { action } from '@storybook/addon-actions';
import faker from 'faker';
import DebtAuctionAuthorizationCheckPanel from './DebtAuctionAuthorizationCheckPanel';

const common = {
    components: { DebtAuctionAuthorizationCheckPanel },
    data() {
        return {
            isDebtAuctionAuthorized: false,
            walletAddress: faker.finance.ethereumAddress(),
            isLoading: false,
            disabled: false,
            isExplanationsShown: true,
        };
    },
    methods: {
        authorize() {
            this.isLoading = true;
            setTimeout(() => {
                this.isDebtAuctionAuthorized = true;
                this.isLoading = false;
            }, 1000);
        },
        isCorrect: action('isCorrect'),
    },
    template: `
    <DebtAuctionAuthorizationCheckPanel
        v-bind="$data"
        @authorizeFlopper="authorize"
        @update:isCorrect="isCorrect"
    />`,
};

storiesOf('Panels/DebtAuctionAuthorizationCheckPanel', module)
    .add('Authorized', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            isDebtAuctionAuthorized: true,
        }),
    }))
    .add('Unauthorized', () => ({
        ...common,
    }))
    .add('Missing Wallet', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            walletAddress: undefined,
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
            isExplanationsShown: false,
        }),
    }));

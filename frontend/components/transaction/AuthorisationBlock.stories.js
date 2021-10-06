import { storiesOf } from '@storybook/vue';
import faker from 'faker';
import AuthorisationBlock from '~/components/transaction/AuthorisationBlock';

const common = {
    components: { AuthorisationBlock },
    data() {
        return {
            isLoading: false,
            isWalletAuthorised: false,
            isCollateralAuthorised: false,
            currencyType: faker.finance.currencyCode(),
        };
    },
    methods: {
        authorizeWallet() {
            this.isLoading = true;
            setTimeout(() => {
                this.isWalletAuthorised = true;
                this.isLoading = false;
            }, 1000);
        },
        authorizeCollateral() {
            this.isLoading = true;
            setTimeout(() => {
                this.isCollateralAuthorised = true;
                this.isLoading = false;
            }, 1000);
        },
    },
};

storiesOf('Transaction/AuthorisationBlock', module)
    .add('Default', () => ({
        ...common,
        template:
            '<AuthorisationBlock :isLoading="isLoading" :isWalletAuthorised="isWalletAuthorised" :isCollateralAuthorised="isCollateralAuthorised"  @authorizeWallet="authorizeWallet" @authorizeCollateral="authorizeCollateral" :collateralType="currencyType"/>',
    }))
    .add('Disabled', () => ({
        ...common,
        template: '<AuthorisationBlock :disabled="true" :collateralType="currencyType" />',
    }))
    .add('Not Authorized', () => ({
        ...common,
        template: '<AuthorisationBlock :collateralType="currencyType" />',
    }))
    .add('Authorizing', () => ({
        ...common,
        template: '<AuthorisationBlock :isLoading="true" :collateralType="currencyType" />',
    }))
    .add('Authorized', () => ({
        ...common,
        template:
            '<AuthorisationBlock :isWalletAuthorised="true" :isCollateralAuthorised="true" :collateralType="currencyType"/>',
    }));

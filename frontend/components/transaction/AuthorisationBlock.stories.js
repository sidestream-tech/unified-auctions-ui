import { storiesOf } from '@storybook/vue';
import faker from 'faker';
import AuthorisationBlock from '~/components/transaction/AuthorisationBlock';

const common = {
    components: { AuthorisationBlock },
    data() {
        return {
            isLoading: false,
            isAuthorized: false,
            currencyType: faker.lorem.word(),
        };
    },
    methods: {
        authorize() {
            this.isLoading = true;
            setTimeout(() => {
                this.isAuthorized = true;
                this.isLoading = false;
            }, 1000);
        },
    },
};

storiesOf('Transaction/AuthorisationBlock', module)
    .add('Default', () => ({
        ...common,
        template:
            '<AuthorisationBlock :isLoading="isLoading" :isAuthorized="isAuthorized" @authorize="authorize" :collateralType="currencyType"/>',
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
        template: '<AuthorisationBlock :isAuthorized="true" :collateralType="currencyType"/>',
    }));

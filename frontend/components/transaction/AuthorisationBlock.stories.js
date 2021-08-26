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
            '<AuthorisationBlock :isLoading="isLoading" :isAuthorized="isAuthorized" @authorize="authorize" :currencyType="currencyType"/>',
    }))
    .add('Disabled', () => ({
        ...common,
        template: '<AuthorisationBlock :disabled="true" :currencyType="currencyType" />',
    }))
    .add('Not Authorized', () => ({
        ...common,
        template: '<AuthorisationBlock :currencyType="currencyType" />',
    }))
    .add('Authorizing', () => ({
        ...common,
        template: '<AuthorisationBlock :isLoading="true" :currencyType="currencyType" />',
    }))
    .add('Authorized', () => ({
        ...common,
        template: '<AuthorisationBlock :isAuthorized="true" :currencyType="currencyType"/>',
    }));

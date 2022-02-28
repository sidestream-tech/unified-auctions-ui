import { storiesOf } from '@storybook/vue';
import AccessDaiBlock from './AccessDaiBlock';

const common = {
    components: { AccessDaiBlock },
};

storiesOf('Transaction/AccessDaiBlock', module)
    .add('Default', () => ({
        ...common,
        template: '<AccessDaiBlock />',
    }))
    .add('Disabled', () => ({
        ...common,
        template: '<AccessDaiBlock disabled />',
    }))
    .add('Loading', () => ({
        ...common,
        template: '<AccessDaiBlock is-loading />',
    }))
    .add('Access Granted', () => ({
        ...common,
        template: '<AccessDaiBlock is-dai-access-granted />',
    }))
    .add('Expert Mode', () => ({
        ...common,
        template: '<AccessDaiBlock :is-explanations-shown="false" />',
    }));

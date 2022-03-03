import { storiesOf } from '@storybook/vue';
import AccessDaiBlock from './AccessDaiBlock';

const common = {
    components: { AccessDaiBlock },
};

storiesOf('Transaction/AccessDaiBlock', module)
    .add('Default', () => ({
        ...common,
        template: '<AccessDaiBlock :is-dai-access-granted="false"/>',
    }))
    .add('Disabled', () => ({
        ...common,
        template: '<AccessDaiBlock :is-dai-access-granted="false" disabled />',
    }))
    .add('Loading', () => ({
        ...common,
        template: '<AccessDaiBlock :is-dai-access-granted="false" is-loading />',
    }))
    .add('Access Granted', () => ({
        ...common,
        template: '<AccessDaiBlock is-dai-access-granted />',
    }))
    .add('Expert Mode', () => ({
        ...common,
        template: '<AccessDaiBlock :is-dai-access-granted="false" :is-explanations-shown="false" />',
    }));

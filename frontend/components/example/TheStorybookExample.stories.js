import { storiesOf } from '@storybook/vue';
import { action } from '@storybook/addon-actions';
import TheStorybookExample from './TheStorybookExample';

/*
    Here is the place where you should add all props
    of the component to see/show its different states
*/

const common = {
    components: { TheStorybookExample },
    methods: {
        submitAction: action('submit'),
    },
};

storiesOf('example/TheStorybookExample', module)
    .add('Empty input', () => ({
        ...common,
        template: '<TheStorybookExample placeholder="placeholder test" @submit="submitAction" />',
    }))
    .add('Prefilled value', () => ({
        ...common,
        components: { TheStorybookExample },
        template: '<TheStorybookExample value="Prefilled value" />',
    }));

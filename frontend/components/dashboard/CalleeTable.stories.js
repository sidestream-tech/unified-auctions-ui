import { storiesOf } from '@storybook/vue';
import CalleeTable from './CalleeTable';
import { generateFakeCallees } from '~/helpers/generateFakeCallee';

const common = {
    components: { CalleeTable },
};

storiesOf('Dashboard/CalleeTable', module)
    .add('Default', () => ({
        ...common,
        computed: {
            callees() {
                return generateFakeCallees();
            },
        },
        template: '<CalleeTable :callees="callees" />',
    }))
    .add('No Callees for Network', () => ({
        ...common,
        template: '<CalleeTable />',
    }));

import { storiesOf } from '@storybook/vue';
import CalleeTable from './CalleeTable';

storiesOf('CalleeTable', module).add('Default', () => ({
    components: { CalleeTable },
    template: '<CalleeTable/>',
}));

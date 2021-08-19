import { storiesOf } from '@storybook/vue';
import Header from '~/components/layout/Header';

const common = {
    components: { Header },
};

storiesOf('Layout/Header', module).add('Default', () => ({
    ...common,
    template: '<Header />',
}));

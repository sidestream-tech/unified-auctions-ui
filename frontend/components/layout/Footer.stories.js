import { storiesOf } from '@storybook/vue';
import Footer from './Footer';

const common = {
    components: { Footer },
};

storiesOf('Layout/Footer', module).add('Default', () => ({
    ...common,
    template: `<Footer />`,
}));

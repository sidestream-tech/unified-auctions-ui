import { storiesOf } from '@storybook/vue';
import StagingHeader from '~/components/layout/StagingHeader';

const common = {
    components: { StagingHeader },
};

storiesOf('Layout/StagingHeader', module).add('Default', () => ({
    ...common,
    template: `<StagingHeader />`,
}));

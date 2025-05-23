import { storiesOf } from '@storybook/vue';
import StagingBanner from './StagingBanner';

const common = {
    components: { StagingBanner },
};

storiesOf('Layout/StagingBanner', module).add('Default', () => ({
    ...common,
    template: `<StagingBanner url="https://example.com/" />`,
}));

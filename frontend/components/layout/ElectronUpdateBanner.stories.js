import { storiesOf } from '@storybook/vue';
import ElectronUpdateBanner from './ElectronUpdateBanner';

const common = {
    components: { ElectronUpdateBanner },
};

storiesOf('Layout/ElectronUpdateBanner', module).add('Default', () => ({
    ...common,
    template: `<ElectronUpdateBanner url="https://example.com/" />`,
}));

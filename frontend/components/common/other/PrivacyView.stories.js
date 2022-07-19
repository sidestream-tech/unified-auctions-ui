import { storiesOf } from '@storybook/vue';
import PrivacyView from './PrivacyView';

const common = {
    components: { PrivacyView },
};

storiesOf('Common/Other/PrivacyView', module).add('Default', () => ({
    ...common,
    template: '<PrivacyView />',
}));

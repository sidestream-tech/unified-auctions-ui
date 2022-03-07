import { storiesOf } from '@storybook/vue';
import PrivacyView from '~/components/PrivacyView';

const common = {
    components: { PrivacyView },
};

storiesOf('PrivacyView', module).add('Default', () => ({
    ...common,
    template: '<PrivacyView />',
}));

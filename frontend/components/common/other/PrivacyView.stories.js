import { storiesOf } from '@storybook/vue';
import PrivacyView from '~/components/common/other/PrivacyView';

const common = {
    components: { PrivacyView },
};

storiesOf('Common/Other/PrivacyView', module).add('Default', () => ({
    ...common,
    template: '<PrivacyView />',
}));

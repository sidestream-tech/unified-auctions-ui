import { storiesOf } from '@storybook/vue';
import TermsText from '~/components/TermsText';

const common = {
    components: { TermsText },
};

storiesOf('TermsText', module).add('Default', () => ({
    ...common,
    template: '<TermsText />',
}));

import { storiesOf } from '@storybook/vue';
import { action } from '@storybook/addon-actions';
import TermsModal from './TermsModal';

const common = {
    components: { TermsModal },
    data: () => ({
        isShown: true,
    }),
    methods: {
        accept: action('accept'),
        close: action('close'),
    },
};

storiesOf('Modals/TermsModal', module).add('Default', () => ({
    ...common,
    template: '<TermsModal :isShown="isShown" @accept="accept" @close="close"/>',
}));

import { storiesOf } from '@storybook/vue';
import { action } from '@storybook/addon-actions';
import CollateralModal from './CollateralModal';

const common = {
    components: { CollateralModal },
    data: () => ({
        isShown: true,
    }),
    methods: {
        accept: action('accept'),
        close: action('close'),
    },
};

storiesOf('Modals/CollateralModal', module).add('Default', () => ({
    ...common,
    template: '<CollateralModal :isShown="isShown" @accept="accept" @close="close" />',
}));

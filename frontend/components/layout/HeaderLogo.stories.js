import { storiesOf } from '@storybook/vue';
import { action } from '@storybook/addon-actions';
import HeaderLogo from '~/components/layout/HeaderLogo';

const common = {
    components: { HeaderLogo },
    methods: {
        updateNetwork: action('updateNetwork'),
        updateIsExplanationsShown: action('updateIsExplanationsShown'),
    },
    data: () => ({
        network: null,
        isExplanationsShown: true,
    }),
};

storiesOf('Layout/HeaderLogo', module).add('Default', () => ({
    ...common,
    template: `<HeaderLogo />`,
}));

import { storiesOf } from '@storybook/vue';
import { action } from '@storybook/addon-actions';
import ThemeSwitcher from './ThemeSwitcher';

const common = {
    components: { ThemeSwitcher },
    methods: {
        update: action('update'),
    },
};

storiesOf('Layout/ThemeSwitcher', module).add('Default', () => ({
    ...common,
    template: '<theme-switcher :dark-mode="true" @update="update"/>',
}));

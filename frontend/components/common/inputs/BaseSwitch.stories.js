import { storiesOf } from '@storybook/vue';
import { action } from '@storybook/addon-actions';
import BaseSwitch from './BaseSwitch.vue';

storiesOf('Common/Inputs/BaseSwitch', module).add('Default', () => ({
    components: {
        BaseSwitch,
    },
    methods: {
        switchButton: action('switchButton'),
    },
    data: () => ({ isChecked: false }),
    template: '<BaseSwitch :isChecked.sync="isChecked" @update:isChecked="switchButton" />',
}));

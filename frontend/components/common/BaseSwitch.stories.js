import { storiesOf } from '@storybook/vue';
import { action } from '@storybook/addon-actions';
import BaseSwitch from '~/components/common/BaseSwitch.vue';

storiesOf('Common/BaseSwitch', module).add('Default', () => ({
    components: {
        BaseSwitch,
    },
    methods: {
        switchButton: action('switchButton'),
    },
    data: () => ({ isChecked: false }),
    template: '<BaseSwitch :isChecked.sync="isChecked" @update:isChecked="switchButton" />',
}));

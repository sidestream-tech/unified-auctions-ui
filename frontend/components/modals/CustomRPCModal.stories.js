import { storiesOf } from '@storybook/vue';
import { action } from '@storybook/addon-actions';
import CustomRPCModal from './CustomRPCModal';

const common = {
    components: { CustomRPCModal },
    methods: {
        submit: action('submit'),
    },
};

storiesOf('Modals/CustomRPCModal', module).add('Default', () => ({
    ...common,
    template: `<CustomRPCModal
        accessToken="testToken"
        simulationIds="simulationId1, simulationId2"
        @submit="submit"
    />`,
}));

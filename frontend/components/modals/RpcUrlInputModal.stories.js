import { storiesOf } from '@storybook/vue';
import RpcUrlInputModal from './RpcUrlInputModal.vue';

const common = {
    components: { RpcUrlInputModal },
    template: '<RpcUrlInputModal />',
};

storiesOf('Modals/RpcUrlInputModal', module).add('Default', () => ({
    ...common,
}));

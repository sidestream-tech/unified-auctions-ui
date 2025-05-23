import { storiesOf } from '@storybook/vue';
import RpcUrlConfigurationModal from './RpcUrlConfigurationModal.vue';

const FAKE_INFURA_ID = 'https://mainnet.infura.io/v3/12345';

const common = {
    components: { RpcUrlConfigurationModal },
    data() {
        return {
            currentRpcUrl: FAKE_INFURA_ID,
            disabled: false,
        };
    },
    methods: {
        connect() {
            this.disabled = true;
            setTimeout(() => {
                this.disabled = false;
            }, 1000);
        },
    },
    template: '<RpcUrlConfigurationModal :disabled="disabled" @configureRpcUrl="connect()" />',
};

storiesOf('Modals/RpcUrlConfigurationModal', module)
    .add('Default', () => ({
        ...common,
    }))
    .add('Current RPC URL', () => ({
        ...common,
        template:
            '<RpcUrlConfigurationModal :current-rpc-url="currentRpcUrl" :disabled="disabled" @configureRpcUrl="connect()" />',
    }))
    .add('Connecting', () => ({
        ...common,
        template: '<RpcUrlConfigurationModal :disabled="true" />',
    }))
    .add('Reconnecting', () => ({
        ...common,
        template: '<RpcUrlConfigurationModal :current-rpc-url="currentRpcUrl" :disabled="true" />',
    }));

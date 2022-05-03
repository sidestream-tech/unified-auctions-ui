import { storiesOf } from '@storybook/vue';
import faker from 'faker';
import RpcForm from './RpcForm';

const common = {
    components: { RpcForm },
    data: () => ({
        url: '',
        isConnected: false,
        isLoading: false,
        disabled: false,
    }),
    methods: {
        submit() {
            if (this.isConnected) {
                this.disconnect();
                return;
            }
            this.connect();
        },
        connect() {
            this.isLoading = true;
            setTimeout(() => {
                this.isLoading = false;
                this.isConnected = true;
            }, 1000);
        },
        disconnect() {
            this.isLoading = true;
            setTimeout(() => {
                this.isLoading = false;
                this.isConnected = false;
            }, 1000);
        },
    },
    template: `
    <RpcForm 
        :url="url" 
        :isConnected="isConnected" 
        :isLoading="isLoading" 
        :disabled="disabled" 
        @submit="submit" 
    />`,
};

storiesOf('Simulation/RpcForm', module)
    .add('Default', () => ({
        ...common,
    }))
    .add('Pre-input URL', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            url: faker.internet.url(),
        }),
    }))
    .add('Loading', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            isLoading: true,
        }),
    }))
    .add('Disabled', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            disabled: true,
        }),
    }));

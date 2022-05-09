import { storiesOf } from '@storybook/vue';
import { action } from '@storybook/addon-actions';
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
        submit(url) {
            if (this.isConnected) {
                this.disconnect(url);
                return;
            }
            this.connect(url);
        },
        connect(url) {
            this.isLoading = true;
            setTimeout(() => {
                this.isLoading = false;
                this.isConnected = true;
                action('connect')(url);
            }, 1000);
        },
        disconnect(url) {
            this.isLoading = true;
            setTimeout(() => {
                this.isLoading = false;
                this.isConnected = false;
                action('disconnect')(url);
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
            url: `https:${faker.internet.url().split(':')[1]}`,
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

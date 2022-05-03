import { storiesOf } from '@storybook/vue';
import { action } from '@storybook/addon-actions';
import faker from 'faker';
import SimulationForm from './SimulationForm';

const common = {
    components: { SimulationForm },
    data: () => ({
        token: '',
        simulationIds: faker.datatype.array(10).join(','),
        isStarted: false,
        isLoading: false,
        disabled: false,
    }),
    methods: {
        submit(formValues) {
            if (this.isStarted) {
                this.stopSimulation(formValues.token, formValues.simulationId);
                return;
            }
            this.startSimulation(formValues.token, formValues.simulationId);
        },
        startSimulation(token, simulationId) {
            this.isLoading = true;
            setTimeout(() => {
                this.isLoading = false;
                this.isStarted = true;
                action('started')(token, simulationId);
            }, 1000);
        },
        stopSimulation(token, simulationId) {
            this.isLoading = true;
            setTimeout(() => {
                this.isLoading = false;
                this.isStarted = false;
                action('stopped')(token, simulationId);
            }, 1000);
        },
    },
    template: `
    <SimulationForm 
        :token="token" 
        :simulation-ids="simulationIds"
        :isStarted="isStarted"
        :isLoading="isLoading"
        :disabled="disabled"
        @submit="submit"
    />`,
};

storiesOf('Simulation/SimulationForm', module)
    .add('Default', () => ({
        ...common,
    }))
    .add('Pre-input access token', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            token: faker.datatype.uuid(),
        }),
    }))
    .add('No simulations', () => ({
        ...common,
        data: () => ({
            simulationIds: '',
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

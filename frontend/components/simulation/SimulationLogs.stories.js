import { storiesOf } from '@storybook/vue';
import faker from 'faker';
import SimulationLogs from './SimulationLogs';

const randomLogs = length => {
    return faker.datatype.array(length).map(() => {
        return `${faker.date.recent().toISOString()}: ${faker.lorem.sentence()}`;
    });
};

const common = {
    components: { SimulationLogs },
    data: () => ({
        logs: randomLogs(5),
    }),
    template: '<SimulationLogs :logs="logs"/>',
};

storiesOf('Simulation/SimulationLogs', module)
    .add('Default', () => ({
        ...common,
    }))
    .add('Long logs', () => ({
        ...common,
        data: () => ({
            logs: randomLogs(100),
        }),
    }))
    .add('No logs', () => ({
        ...common,
        data: () => ({
            logs: [],
        }),
    }));

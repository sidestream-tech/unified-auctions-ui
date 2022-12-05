import { storiesOf } from '@storybook/vue';
import faker from 'faker';
import TimeTill from './TimeTill';

storiesOf('Common/Formatters/TimeTill', module)
    .add('Default', () => ({
        components: { TimeTill },
        data: () => ({
            date: faker.date.soon(),
        }),
        template: `<TimeTill :date="date"/>`,
    }))
    .add('Ending soon', () => ({
        components: { TimeTill },
        data: () => ({
            date: new Date(Date.now() + 1000 * 60 * 15 + 5000).toUTCString(),
        }),
        template: `<TimeTill :date="date" />`,
    }))
    .add('Ending', () => ({
        components: { TimeTill },
        data: () => ({
            date: new Date(Date.now() + 5000).toUTCString(),
        }),
        template: `<TimeTill :date="date" />`,
    }))
    .add('Invalid date', () => ({
        components: { TimeTill },
        template: `<TimeTill date="Invalid Date" />`,
    }))
    .add('Recent Past', () => ({
        components: { TimeTill },
        data: () => ({
            date: faker.date.recent(),
        }),
        template: `<TimeTill :date="date" />`,
    }))
    .add('Late Past', () => ({
        components: { TimeTill },
        data: () => ({
            date: faker.date.past(),
        }),
        template: `<TimeTill :date="date" />`,
    }));

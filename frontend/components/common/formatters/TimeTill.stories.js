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
    }));

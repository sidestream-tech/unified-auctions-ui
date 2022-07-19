import { storiesOf } from '@storybook/vue';
import faker from 'faker';
import TextBlock from './TextBlock';

storiesOf('Common/Other/TextBlock', module)
    .add('Default', () => ({
        components: { TextBlock },
        data() {
            return {
                title: faker.lorem.words(5),
                text: faker.lorem.paragraphs(5),
            };
        },
        template: `
        <TextBlock :title="title" >
            <div class="text-gray-800">{{ text }}</div>
        </TextBlock >`,
    }))
    .add('No Title', () => ({
        components: { TextBlock },
        data() {
            return {
                text: faker.lorem.paragraphs(5),
            };
        },
        template: `
        <TextBlock >
            <div class="text-gray-800">{{ text }}</div>
        </TextBlock >`,
    }));

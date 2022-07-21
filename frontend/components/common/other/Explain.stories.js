import { storiesOf } from '@storybook/vue';
import faker from 'faker';
import Explain from './Explain';

const common = {
    components: { Explain },
    data() {
        return {
            textBefore: faker.lorem.words(),
            text: faker.lorem.word(),
            explanation: faker.lorem.sentence(),
            textAfter: faker.lorem.words(),
        };
    },
};

storiesOf('Common/Other/Explain', module).add('Default', () => ({
    ...common,
    template: '<span>{{ textBefore }} <Explain :text="text">{{ explanation }}</Explain> {{ textAfter }}</span>',
}));

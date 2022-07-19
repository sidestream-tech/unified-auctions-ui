import { storiesOf } from '@storybook/vue';
import { action } from '@storybook/addon-actions';
import faker from 'faker';
import Select from './Select';

const common = {
    components: { Select },
    data() {
        return {
            options: [
                { label: faker.lorem.words(2), value: 'O1' },
                { label: faker.lorem.words(2), value: 'O2' },
                { label: faker.lorem.words(2), value: 'O3' },
                { label: faker.lorem.words(2), value: 'O4' },
            ],
            selectedOption: '01',
        };
    },
    methods: {
        select: action('select'),
    },
};

storiesOf('Common/Inputs/Select', module).add('Default', () => ({
    ...common,
    template:
        '<Select v-model="selectedOption" :options="options" @input="select"><template #text-prefix>[PREFIX]</template></Select>',
}));

import { storiesOf } from '@storybook/vue';
import faker from 'faker';
import SplitLayout from './SplitLayout.vue';

const fakeContent = faker.lorem.paragraphs(5);

const common = {
    template: `<SplitLayout :isShown.sync="isShown" class="h-screen w-full">
        <div>{{ fakeContent }}</div>
        <button class="bg-green-200" @click="isShown = true">Open side panel</button>
        <template #side>
            <div class="mt-5 ml-10 mr-16">{{ fakeContent }}</div>
        </template> 
    </SplitLayout>`,
    components: {
        SplitLayout,
    },
};

storiesOf('Layout/SplitLayout', module)
    .add('Default', () => ({
        ...common,
        data: () => ({ isShown: false, fakeContent }),
    }))
    .add('Opened', () => ({
        ...common,
        data: () => ({ isShown: true, fakeContent }),
    }));

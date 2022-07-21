import { storiesOf } from '@storybook/vue';
import faker from 'faker';
import SplitLayout from './SplitLayout.vue';
import Button from '~/components/common/inputs/BaseButton.vue';

const fakeContent = faker.lorem.paragraphs(150);

const common = {
    template: `<div class="h-screen w-full"><SplitLayout :step.sync="step">
        <template #step0>
            <Button type="primary" @click="step = 1">Open side panel</Button>
            <div>Step0: {{ fakeContent }}</div>
        </template>
        <template #step1>
            <Button class="mx-2" type="primary" @click='step = 2'>Go to step 2</Button>
            <div class="mx-2">Step1: {{ fakeContent }}</div>
        </template> 
        <template #step2>
            <div class="mx-2">Step2: {{ fakeContent }}</div>
        </template> 
    </SplitLayout></div>`,
    components: {
        SplitLayout,
        Button,
    },
};

storiesOf('Layout/SplitLayout', module)
    .add('Default', () => ({
        ...common,
        data: () => ({ step: 0, fakeContent }),
    }))
    .add('First Panel Opened', () => ({
        ...common,
        data: () => ({ step: 1, fakeContent }),
    }))
    .add('Second Panel Opened', () => ({
        ...common,
        data: () => ({ step: 2, fakeContent }),
    }));

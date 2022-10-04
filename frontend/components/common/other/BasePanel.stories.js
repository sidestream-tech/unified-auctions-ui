import { storiesOf } from '@storybook/vue';
import faker from 'faker';
import BasePanel from './BasePanel.vue';

const common = {
    components: { BasePanel },
    data: () => ({
        inactive: `This is the inactive title`,
        incorrect: `This is the incorrect title`,
        attention: `This is the attention title`,
        correct: `This is the correct title`,
        notice: `This is the notice`,
    }),
};

storiesOf('Common/Other/BasePanel', module)
    .add('Stack of panels', () => ({
        ...common,
        template: `<div>
            <BasePanel currentState="incorrect"><template #title>{{ incorrect }}</template>Error content</BasePanel>
            <BasePanel currentState="attention"><template #title>{{ attention }}</template>Attention content</BasePanel>
            <BasePanel currentState="notice"><template #title>{{ notice }}</template>Notice content</BasePanel>
            <BasePanel currentState="correct"><template #title>{{ correct }}</template>Correct content</BasePanel>
            <BasePanel currentState="inactive"><template #title>{{ inactive }}</template>Inactive content</BasePanel>
        </div>`,
    }))
    .add('Inactive', () => ({
        ...common,
        template:
            '<BasePanel currentState="inactive"><template #title>{{ inactive }}</template>Inactive content</BasePanel>',
    }))
    .add('Incorrect', () => ({
        ...common,
        template:
            '<BasePanel currentState="incorrect"><template #title>{{ incorrect }}</template>Incorrect content</BasePanel>',
    }))
    .add('Attention', () => ({
        ...common,
        template:
            '<BasePanel currentState="attention"><template #title>{{ attention }}</template>Attention content</BasePanel>',
    }))
    .add('Correct', () => ({
        ...common,
        template:
            '<BasePanel currentState="correct"><template #title>{{ correct }}</template>Correct content</BasePanel>',
    }))
    .add('Notice', () => ({
        ...common,
        template:
            '<BasePanel currentState="notice"><template #title>{{ notice }}</template>Notice content</BasePanel>',
    }))
    .add('Very long notice', () => ({
        ...common,
        template: `<BasePanel currentState="notice">
            <template #title>${faker.lorem.sentence(20)}</template>
            Content: ${faker.lorem.sentence(50)}
        </BasePanel>`,
    }))
    .add('Notice with html', () => ({
        ...common,
        template: `<BasePanel currentState="notice">
            <template #title>Title with <i>italic</i> text</template>
            Content: ${faker.lorem.sentence(50)}
        </BasePanel>`,
    }));

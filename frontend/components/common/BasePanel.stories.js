import { storiesOf } from '@storybook/vue';
import faker from 'faker';
import BasePanel from './BasePanel.vue';

const common = {
    components: { BasePanel },
    data: () => ({
        inactive: `This is the inactive title`,
        incorrect: `This is the incorrect title`,
        correct: `This is the correct title`,
        notice: `This is the notice`,
    }),
};

storiesOf('common/BasePanel', module)
    .add('Stack of panels', () => ({
        ...common,
        template: `<div>
            <BasePanel v-bind="$data" currentState="incorrect"> Error content </BasePanel>
            <BasePanel v-bind="$data" currentState="notice"> Notice content </BasePanel>
            <BasePanel v-bind="$data" currentState="correct"> Correct content </BasePanel>
            <BasePanel v-bind="$data" currentState="inactive"> Inactive content </BasePanel>
        </div>`,
    }))
    .add('Inactive', () => ({
        ...common,
        template: '<BasePanel v-bind="$data" currentState="inactive"> Inactive content </BasePanel>',
    }))
    .add('Incorrect', () => ({
        ...common,
        template: '<BasePanel v-bind="$data" currentState="incorrect"> Incorrect content </BasePanel>',
    }))
    .add('Correct', () => ({
        ...common,
        template: '<BasePanel v-bind="$data" currentState="correct"> Correct content </BasePanel>',
    }))
    .add('Notice', () => ({
        ...common,
        template: '<BasePanel v-bind="$data" currentState="notice"> Notice content </BasePanel>',
    }))
    .add('Very long notice', () => ({
        ...common,
        template: `<BasePanel notice="${faker.lorem.sentence(20)}" currentState="notice">
            Content: ${faker.lorem.sentence(50)}
        </BasePanel>`,
    }))
    .add('Notice with html', () => ({
        ...common,
        template: `<BasePanel currentState="notice">
            <template #notice>Title with <i>italic</i> text</template>
            Content: ${faker.lorem.sentence(50)}
        </BasePanel>`,
    }));

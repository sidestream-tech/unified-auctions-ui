import { storiesOf } from '@storybook/vue';
import BaseButton from './BaseButton.vue';

storiesOf('Common/Inputs/BaseButton', module)
    .add('Default', () => ({
        components: {
            BaseButton,
        },
        template: '<BaseButton>I am a button!</BaseButton>',
    }))
    .add('Primary', () => ({
        components: {
            BaseButton,
        },
        template: '<BaseButton type="primary">I am a button!</BaseButton>',
    }))
    .add('Danger', () => ({
        components: {
            BaseButton,
        },
        template: '<BaseButton type="danger">I am a button!</BaseButton>',
    }))
    .add('Link', () => ({
        components: {
            BaseButton,
        },
        template: '<BaseButton type="link">I am a button!</BaseButton>',
    }))
    .add('Disabled', () => ({
        components: {
            BaseButton,
        },
        template: '<BaseButton disabled type="danger">I am a button!</BaseButton>',
    }))
    .add('Loading', () => ({
        components: {
            BaseButton,
        },
        template: '<BaseButton is-loading type="danger">I am a button!</BaseButton>',
    }));

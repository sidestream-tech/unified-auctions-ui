import { storiesOf } from '@storybook/vue';
import AnimatedArrow from './AnimatedArrow';

const common = {
    components: {
        AnimatedArrow,
    },
    data() {
        return {
            index: 0,
            directions: ['up', 'down', 'left', 'right'],
        };
    },
    methods: {
        switch() {
            setInterval(() => {
                this.index = Math.floor(Math.random() * 4);
            }, 1500);
        },
    },
    beforeMount() {
        this.switch();
    },
};

storiesOf('Common/Other/AnimatedArrow', module)
    .add('Default', () => ({
        ...common,
        template: '<AnimatedArrow :size="16" />',
    }))
    .add('Down', () => ({
        ...common,
        template: `<AnimatedArrow :size="16" direction="down" />`,
    }))
    .add('Left', () => ({
        ...common,
        template: '<AnimatedArrow :size="16" direction="left" />',
    }))
    .add('Right', () => ({
        ...common,
        template: '<AnimatedArrow :size="16" direction="right" />',
    }))
    .add('Big', () => ({
        ...common,
        template: '<AnimatedArrow :size="64" />',
    }))
    .add('Switching', () => ({
        ...common,
        template: '<AnimatedArrow :size="16" :direction="directions[index]" />',
    }));

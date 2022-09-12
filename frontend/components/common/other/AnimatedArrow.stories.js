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
                this.index = (this.index + 1) % 4;
            }, 2500);
        },
    },
    mounted() {
        this.switch();
    },
};

storiesOf('Common/Other/AnimatedArrow', module)
    .add('Default', () => ({
        ...common,
        template: '<AnimatedArrow direction="up" class="h-4" />',
    }))
    .add('Down', () => ({
        ...common,
        template: `<AnimatedArrow direction="down" class="h-4" />`,
    }))
    .add('Left', () => ({
        ...common,
        template: '<AnimatedArrow direction="left" class="h-4" />',
    }))
    .add('Right', () => ({
        ...common,
        template: '<AnimatedArrow direction="right" class="h-4" />',
    }))
    .add('Big', () => ({
        ...common,
        template: '<AnimatedArrow direction="up" class="h-8" />',
    }))
    .add('Up Down Left Right', () => ({
        ...common,
        template: '<AnimatedArrow :direction="directions[index]" class="h-4" />',
    }));

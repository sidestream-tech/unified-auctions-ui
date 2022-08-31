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
        template: '<AnimatedArrow />',
    }))
    .add('Down', () => ({
        ...common,
        template: `<AnimatedArrow direction="down" />`,
    }))
    .add('Left', () => ({
        ...common,
        template: '<AnimatedArrow direction="left" />',
    }))
    .add('Right', () => ({
        ...common,
        template: '<AnimatedArrow direction="right" />',
    }))
    .add('Big', () => ({
        ...common,
        template: '<AnimatedArrow :size="64" />',
    }))
    .add('Up Down Left Right', () => ({
        ...common,
        template: '<AnimatedArrow :direction="directions[index]" />',
    }));

<template>
    <UpArrow :style="style" />
</template>

<script lang="ts">
import Vue from 'vue';
import UpArrow from '~/assets/icons/uparrow.svg';

type ArrowDirections = 'up' | 'down' | 'left' | 'right';

export default Vue.extend({
    components: {
        UpArrow,
    },
    props: {
        size: {
            type: String,
            default: '16px',
        },
        direction: {
            type: String as Vue.PropType<ArrowDirections>,
            default: 'up',
        },
    },
    computed: {
        style(): Object {
            let rotationDegree = 0;
            if (this.direction === 'down') {
                rotationDegree = 180;
            }
            if (this.direction === 'left') {
                rotationDegree = -90;
            }
            if (this.direction === 'right') {
                rotationDegree = 90;
            }
            return {
                height: this.size,
                width: 'auto',
                transform: `rotate(${rotationDegree}deg)`,
                transition: 'transform 0.5s linear',
            };
        },
    },
});
</script>

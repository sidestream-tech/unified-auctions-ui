<template>
    <UpArrow :style="style" />
</template>

<script lang="ts">
import Vue from 'vue';
import UpArrow from '~/assets/icons/uparrow.svg';

export default Vue.extend({
    components: {
        UpArrow,
    },
    props: {
        size: {
            type: Number,
            default: 16,
        },
        direction: {
            type: String,
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
                height: `${this.size}px`,
                width: 'auto',
                transform: `rotate(${rotationDegree}deg)`,
                transition: 'transform 0.5s linear',
            };
        },
    },
});
</script>

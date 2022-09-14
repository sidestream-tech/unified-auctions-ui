<template>
    <UpArrow v-if="direction" :style="style" />
</template>

<script lang="ts">
import Vue from 'vue';
import UpArrow from '~/assets/icons/uparrow.svg';

export type ArrowDirections = 'up' | 'down' | 'left' | 'right';

export default Vue.extend({
    components: {
        UpArrow,
    },
    props: {
        direction: {
            type: String as Vue.PropType<ArrowDirections>,
            default: undefined,
        },
    },
    computed: {
        style(): Object {
            if (!this.direction) {
                return undefined;
            }
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
                transform: `rotate(${rotationDegree}deg)`,
                transition: 'transform 0.5s linear',
            };
        },
    },
});
</script>

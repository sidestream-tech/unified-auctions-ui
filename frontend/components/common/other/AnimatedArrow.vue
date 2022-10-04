<template>
    <UpArrow :style="style" class="dark:text-white fill-current" />
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
            required: true,
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
                transform: `rotate(${rotationDegree}deg)`,
                transition: 'transform 0.5s linear',
            };
        },
    },
});
</script>

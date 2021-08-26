<template>
    <span :class="isBelowZero && 'text-green-500'"> {{ percentage }}% {{ isBelowZero ? 'below' : 'above' }} </span>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    name: 'FormatMarketValue',
    props: {
        value: {
            type: Number,
            default: 0,
        },
    },
    computed: {
        percentage(): string {
            return Math.abs(this.value * 100).toFixed(2);
        },
        isBelowZero(): boolean {
            return this.value > 0;
        },
    },
});
</script>

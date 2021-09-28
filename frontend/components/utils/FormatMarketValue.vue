<template>
    <span v-if="value !== undefined" :class="{ 'text-primary': isBelowZero }"
        >{{ formattedValue }}% {{ belowOrAbove }}</span
    >
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    name: 'FormatMarketValue',
    props: {
        value: {
            type: Number,
            default: undefined,
        },
    },
    computed: {
        formattedValue(): string {
            return Math.abs(this.value * 100).toFixed(2);
        },
        isBelowZero(): boolean {
            return this.value > 0;
        },
        belowOrAbove(): string {
            if (this.value > 0) {
                return 'below';
            }
            if (this.value < 0) {
                return 'above';
            }
            return '';
        },
    },
});
</script>

<template>
    <span v-if="value !== undefined" :class="{ 'text-primary dark:text-primary-light': isBelowZero }"
        >{{ formattedValue }}% {{ belowOrAbove }}</span
    >
</template>

<script lang="ts">
import Vue from 'vue';
import BigNumber from 'bignumber.js';

export default Vue.extend({
    name: 'FormatMarketValue',
    props: {
        value: {
            type: [Number, BigNumber] as Vue.PropType<Number | BigNumber>,
            default: undefined,
        },
    },
    computed: {
        formattedValue(): string {
            if (BigNumber.isBigNumber(this.value)) {
                return (this.value as BigNumber).absoluteValue().multipliedBy(100).toFixed(2);
            }
            return Math.abs((this.value as number) * 100).toFixed(2);
        },
        isBelowZero(): boolean {
            return this.value < 0;
        },
        belowOrAbove(): string {
            if (this.value < 0) {
                return 'below';
            }
            if (this.value > 0) {
                return 'above';
            }
            return 'same';
        },
    },
});
</script>

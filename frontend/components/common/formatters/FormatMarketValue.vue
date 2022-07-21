<template>
    <span v-if="value !== undefined" :class="{ 'text-primary dark:text-primary-light': isBelowZero }"
        ><animated-number :value="percentage" />% {{ belowOrAbove }}</span
    >
</template>

<script lang="ts">
import Vue from 'vue';
import BigNumber from 'bignumber.js';
import AnimatedNumber from '~/components/common/formatters/AnimatedNumber.vue';

export default Vue.extend({
    name: 'FormatMarketValue',
    components: {
        AnimatedNumber,
    },
    props: {
        value: {
            type: [Number, Object] as Vue.PropType<Number | BigNumber>,
            default: undefined,
        },
    },
    computed: {
        percentage(): number | BigNumber {
            if (BigNumber.isBigNumber(this.value)) {
                return (this.value as BigNumber).absoluteValue().multipliedBy(100);
            }
            return Math.abs((this.value as number) * 100);
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

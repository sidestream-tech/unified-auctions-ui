<template>
    <animated-number
        v-if="isValidNumber"
        :value="formatValue(value)"
        :format-value="formatValue"
        :duration="duration"
    />
</template>
<script lang="ts">
import AnimatedNumber from 'animated-number-vue';
import Vue from 'vue';
import BigNumber from 'bignumber.js';

export default Vue.extend({
    components: {
        AnimatedNumber,
    },
    props: {
        value: {
            type: [Number, Object] as Vue.PropType<Number | BigNumber>,
            default: undefined,
        },
        duration: {
            type: Number,
            default: 500,
        },
        decimalPlaces: {
            type: Number,
            default: 2,
        },
    },
    computed: {
        isValidNumber(): boolean {
            if (BigNumber.isBigNumber(this.value) && this.value.isNaN()) {
                return false;
            }
            return !(this.value === undefined || this.value === null);
        },
    },
    methods: {
        formatValue(value: number | BigNumber): string {
            return value.toFixed(this.decimalPlaces);
        },
    },
});
</script>

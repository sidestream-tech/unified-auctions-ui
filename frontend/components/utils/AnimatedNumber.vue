<template>
    <span v-if="isValidNumber"
        ><animated-number
            v-if="displayFullNumber"
            :value="formatValue(value)"
            :format-value="formatValue"
            :duration="duration"
        /><span v-else> under 0.00001 </span></span
    >
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
            type: [Number, Object] as Vue.PropType<number | BigNumber>,
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
        displayFullNumber(): boolean {
            return this.decimals <= 5;
        },
        decimals(): number {
            if (this.isValidNumber) {
                const decimalCutOff = Math.abs(Math.floor(Math.log10(Number(this.value))));
                return decimalCutOff === Infinity ? this.decimalPlaces || 2 : decimalCutOff;
            }
            return this.decimalPlaces || 2;
        },
        isValidNumber(): boolean {
            if (BigNumber.isBigNumber(this.value) && this.value.isNaN()) {
                return false;
            }
            return !(this.value === undefined || this.value === null);
        },
    },
    methods: {
        formatValue(value: number | BigNumber): string {
            return value.toFixed(this.decimals);
        },
    },
});
</script>

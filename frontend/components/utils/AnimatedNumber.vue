<template>
    <span v-if="isValidNumber"
        ><animated-number
            v-if="displayFullNumber"
            :value="formatValue(value)"
            :format-value="formatValue"
            :duration="duration" /><span v-else>
            under <animated-number :value="0.00001" :format-value="formatValue" :duration="duration" /></span
    ></span>
</template>
<script lang="ts">
import AnimatedNumber from 'animated-number-vue';
import Vue from 'vue';
import BigNumber from 'bignumber.js';

const DECIMAL_PLACES_MAX = 5;
const DECIMAL_PLACES_DEFAULT = 2;

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
            default: DECIMAL_PLACES_DEFAULT,
        },
    },
    computed: {
        displayFullNumber(): boolean {
            return this.decimals <= DECIMAL_PLACES_MAX || this.value < 0;
        },
        decimals(): number {
            if (this.isValidNumber) {
                const decimalCutOff = Math.floor(Math.log10(Math.abs(Number(this.value))));
                return decimalCutOff === Infinity ? this.decimalPlaces || DECIMAL_PLACES_DEFAULT : decimalCutOff;
            }
            return this.decimalPlaces || DECIMAL_PLACES_DEFAULT;
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
            if (this.displayFullNumber) {
                return value.toFixed(this.decimals);
            }
            return value.toFixed(DECIMAL_PLACES_DEFAULT);
        },
    },
});
</script>

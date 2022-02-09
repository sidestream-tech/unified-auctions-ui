<template>
    <span v-if="isValidNumber"
        ><span v-if="isValueSmallButNotZero">under </span
        ><animated-number :value="format(limitedValue)" :format-value="format" :duration="duration"
    /></span>
</template>

<script lang="ts">
import Vue from 'vue';
import AnimatedNumber from 'animated-number-vue';
import BigNumber from 'bignumber.js';

const DECIMAL_PLACES_DEFAULT = 2;
const DECIMAL_PLACES_MAX = 5;

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
        isValidNumber(): boolean {
            if (BigNumber.isBigNumber(this.value) && this.value.isNaN()) {
                return false;
            }
            if (this.value === undefined || this.value === null || Number.isNaN(this.value)) {
                return false;
            }
            return true;
        },
        dynamicDecimalPlaces(): number {
            if (!this.isValidNumber || this.value === 0) {
                return this.decimalPlaces;
            }
            if (!this.isValueSmallButNotZero) {
                return this.decimalPlaces;
            }
            const amountOfZerosInValue = Math.abs(Math.floor(Math.log10(Math.abs(Number(this.value)))));
            if (amountOfZerosInValue < this.decimalPlaces) {
                return this.decimalPlaces;
            }
            if (amountOfZerosInValue > DECIMAL_PLACES_MAX) {
                return DECIMAL_PLACES_MAX;
            }
            return amountOfZerosInValue;
        },
        smallestVisibleNumber(): BigNumber {
            return new BigNumber(1).shiftedBy(-DECIMAL_PLACES_MAX);
        },
        isValueSmallButNotZero(): boolean {
            if (this.value === 0) {
                return false;
            }
            return new BigNumber(this.value).abs().isLessThan(this.smallestVisibleNumber);
        },
        limitedValue(): number | BigNumber {
            if (this.isValueSmallButNotZero) {
                return this.value < 0 ? this.smallestVisibleNumber.multipliedBy(-1) : this.smallestVisibleNumber;
            }
            return this.value;
        },
    },
    methods: {
        format(number: number | BigNumber): string {
            return number.toFixed(this.dynamicDecimalPlaces);
        },
    },
});
</script>

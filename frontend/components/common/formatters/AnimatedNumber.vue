<template>
    <span v-if="isValidNumber"
        ><span v-if="isValueSmallButNotZero">under </span
        ><animated-number :value="format(parsedValue)" :format-value="format" :duration="duration"
    /></span>
</template>

<script lang="ts">
import Vue from 'vue';
import AnimatedNumber from 'animated-number-vue';
import BigNumber from 'bignumber.js';
import {
    isValidNumber,
    isValueSmallButNotZero,
    formatToAutomaticDecimalPoints,
} from 'auctions-core/src/helpers/formatToAutomaticDecimalPoints';

export default Vue.extend({
    components: {
        AnimatedNumber,
    },
    props: {
        value: {
            type: [Number, String, Object] as Vue.PropType<number | string | BigNumber>,
            default: undefined,
        },
        duration: {
            type: Number,
            default: 500,
        },
        decimalPlaces: {
            type: Number,
            default: undefined,
        },
    },
    computed: {
        parsedValue(): number | BigNumber {
            if (typeof this.value === 'string') {
                return parseInt(this.value);
            }
            return this.value;
        },
        isValidNumber(): boolean {
            return isValidNumber(this.parsedValue);
        },
        isValueSmallButNotZero(): boolean {
            return isValueSmallButNotZero(this.parsedValue);
        },
    },
    methods: {
        format(value: number | BigNumber): string {
            return formatToAutomaticDecimalPoints(value, this.decimalPlaces);
        },
    },
});
</script>

<template>
    <span v-if="isValidNumber"
        ><span v-if="isValueSmallButNotZero">under </span
        ><animated-number :value="format(value)" :format-value="format" :duration="duration"
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
        isValidNumber(): boolean {
            return isValidNumber(this.value);
        },
        isValueSmallButNotZero(): boolean {
            return isValueSmallButNotZero(this.value);
        },
    },
    methods: {
        format(value: number | BigNumber): string {
            return formatToAutomaticDecimalPoints(value, this.decimalPlaces);
        },
    },
});
</script>

<template>
    <span v-if="isValidNumber"
        ><span v-if="isValueSmallButNotZero">under </span
        ><animated-number :value="safeValue" :format-value="format" :duration="duration"
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
    formatWithThousandSeparators,
} from 'auctions-core/src/helpers/formatToAutomaticDecimalPoints';

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
            default: undefined,
        },
        formatted: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        safeValue(): number {
            if (BigNumber.isBigNumber(this.value)) {
                return this.value.toNumber();
            }
            return this.value;
        },
        isValidNumber(): boolean {
            return isValidNumber(this.value);
        },
        isValueSmallButNotZero(): boolean {
            return isValueSmallButNotZero(this.value);
        },
    },
    methods: {
        format(value: number | BigNumber): string {
            if (this.formatted) {
                return formatWithThousandSeparators(formatToAutomaticDecimalPoints(value, this.decimalPlaces));
            }
            return formatToAutomaticDecimalPoints(value, this.decimalPlaces);
        },
    },
});
</script>

<template>
    <span v-if="isValidNumber"
        ><span v-if="isValueSmallButNotZero">under </span
        ><animated-number :value="formattedValue" :format-value="format" :duration="duration"
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
        disableThousandSeparators: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        formattedValue(): string {
            return formatToAutomaticDecimalPoints(this.value, this.decimalPlaces, {
                formatWithThousandSeparators: false,
            });
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
            return formatToAutomaticDecimalPoints(value, this.decimalPlaces, {
                formatWithThousandSeparators: !this.disableThousandSeparators,
            });
        },
    },
});
</script>

<template>
    <Popover :content="pureValue" placement="top">
        <span v-if="isValidNumber"
            ><span v-if="isValueSmallButNotZero">under </span
            ><animated-number :value="formattedValue" :format-value="format" :duration="duration"
        /></span>
    </Popover>
</template>

<script lang="ts">
import Vue from 'vue';
import { Popover } from 'ant-design-vue';
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
        Popover,
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
        pureValue(): string {
            if (this.value === undefined) {
                return '';
            }
            if (typeof this.value === 'number') {
                return this.value.toString();
            }
            return this.value.toFixed();
        },
        formattedValue(): string {
            return formatToAutomaticDecimalPoints(this.value, {
                decimalPlaces: this.decimalPlaces,
                disableThousandSeparators: true,
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
            return formatToAutomaticDecimalPoints(value, {
                decimalPlaces: this.decimalPlaces,
                disableThousandSeparators: this.disableThousandSeparators,
            });
        },
    },
});
</script>

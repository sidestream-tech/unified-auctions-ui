<template>
    <span
        >{{ sign }}{{ formattedNumber }}<span class="uppercase"> {{ currency }}</span></span
    >
</template>

<script lang="ts">
import Vue from 'vue';
import BigNumber from 'bignumber.js';

export default Vue.extend({
    name: 'FormatCurrency',
    props: {
        value: {
            type: [Number, Object] as Vue.PropType<Number | BigNumber>,
            default: null,
        },
        currency: {
            type: String,
            default: '',
        },
        showSign: {
            type: Boolean,
            default: false,
        },
        decimals: {
            type: Number,
            default: 2,
        },
    },
    computed: {
        formattedNumber(): string {
            if (this.value === null) {
                return '';
            }
            if (this.value < 0.01) {
                const decimalCutOff = Math.abs(Math.floor(Math.log10(Number(this.value)))) + 1;
                return parseFloat(parseFloat(this.value.toString()).toFixed(decimalCutOff)).toString();
            }
            return this.value.toFixed(this.decimals);
        },
        sign(): string {
            if (!this.showSign) {
                return '';
            }
            if (this.value === null) {
                return '';
            }
            return this.value > 0 ? '+' : '';
        },
    },
});
</script>

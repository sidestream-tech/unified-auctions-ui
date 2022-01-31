<template>
    <span
        >{{ sign
        }}<span v-if="isValidNumber"
            ><animated-number v-if="value > 0.01" :value="value" :decimal-places="decimals" /><span v-else>{{
                formattedNumber
            }}</span></span
        ><span v-else-if="value"> NaN </span><span class="uppercase"> {{ currency }}</span></span
    >
</template>

<script lang="ts">
import Vue from 'vue';
import BigNumber from 'bignumber.js';
import AnimatedNumber from '~/components/utils/AnimatedNumber.vue';

export default Vue.extend({
    name: 'FormatCurrency',
    components: { AnimatedNumber },
    props: {
        value: {
            type: [Number, Object] as Vue.PropType<Number | BigNumber>,
            default: undefined,
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
        formattedNumber(): number {
            if (!this.value.toFixed()) {
                return 0;
            }

            if (this.value < 0.01) {
                const decimalCutOff = Math.abs(Math.floor(Math.log10(Number(this.value)))) + 1;
                return parseFloat(
                    parseFloat(this.value.toString()).toFixed(decimalCutOff === Infinity ? 0 : decimalCutOff)
                );
            }
            return Number(this.value);
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
        isValidNumber(): boolean {
            if (BigNumber.isBigNumber(this.value) && this.value.isNaN()) {
                return false;
            }
            return !(this.value === undefined || this.value === null);
        },
    },
});
</script>
